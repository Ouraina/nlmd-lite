import { supabase } from '../config/supabase';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface AIModelAudit {
  modelVersion: string;
  trainingData: {
    sources: string[];
    size: number;
    lastUpdated: string;
  };
  biasMetrics: {
    demographicParity: number;
    equalizedOdds: number;
    calibration: number;
  };
  performanceMetrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  ethicalCompliance: {
    dataPrivacy: boolean;
    transparencyScore: number;
    explainabilityScore: number;
  };
}

export class ValidationService {
  // AI Model Validation and Auditing
  static async auditAIModel(modelId: string): Promise<AIModelAudit> {
    // In production, this would connect to your ML model registry
    // For now, we'll return a comprehensive audit structure
    return {
      modelVersion: 'v1.2.3',
      trainingData: {
        sources: ['user_interactions', 'notebook_metadata', 'quality_scores'],
        size: 1000000,
        lastUpdated: new Date().toISOString()
      },
      biasMetrics: {
        demographicParity: 0.95, // Score out of 1.0
        equalizedOdds: 0.92,
        calibration: 0.88
      },
      performanceMetrics: {
        accuracy: 0.87,
        precision: 0.84,
        recall: 0.89,
        f1Score: 0.86
      },
      ethicalCompliance: {
        dataPrivacy: true,
        transparencyScore: 0.91,
        explainabilityScore: 0.85
      }
    };
  }

  // Data Privacy Validation
  static async validateDataPrivacy(userId: string, operation: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    try {
      // Check user consent
      const { data: consent } = await supabase
        .from('user_preferences')
        .select('data_sharing_consent, analytics_consent')
        .eq('user_id', userId)
        .maybeSingle();

      if (!consent?.data_sharing_consent && operation.includes('share')) {
        errors.push('User has not consented to data sharing');
        score -= 50;
      }

      if (!consent?.analytics_consent && operation.includes('analytics')) {
        warnings.push('User has limited analytics consent');
        score -= 10;
      }

      // Check data retention policies
      const retentionLimit = new Date();
      retentionLimit.setDate(retentionLimit.getDate() - 365); // 1 year retention

      const { count: oldDataCount } = await supabase
        .from('notebook_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lt('created_at', retentionLimit.toISOString());

      if ((oldDataCount || 0) > 0) {
        warnings.push(`${oldDataCount} old interaction records should be reviewed for retention`);
        score -= 5;
      }

    } catch (error) {
      errors.push('Failed to validate data privacy settings');
      score -= 25;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Security Validation
  static async validateSecurityCompliance(teamId?: string): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    try {
      // Validate team permissions if teamId provided
      if (teamId) {
        const { data: members } = await supabase
          .from('team_members')
          .select('role')
          .eq('team_id', teamId);

        const ownerCount = members?.filter(m => m.role === 'owner').length || 0;
        if (ownerCount === 0) {
          errors.push('Team must have at least one owner');
          score -= 40;
        }

        if (ownerCount > 3) {
          warnings.push('Consider limiting the number of team owners');
          score -= 5;
        }
      }

      // Check for suspicious activity patterns
      const { data: recentActivity } = await supabase
        .from('audit_logs')
        .select('action, created_at')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      const suspiciousPatterns = this.detectSuspiciousActivity(recentActivity || []);
      if (suspiciousPatterns.length > 0) {
        warnings.push(`Detected ${suspiciousPatterns.length} suspicious activity patterns`);
        score -= suspiciousPatterns.length * 5;
      }

    } catch (error) {
      errors.push('Failed to validate security compliance');
      score -= 25;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Performance Validation
  static async validatePerformance(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    try {
      // Check database performance metrics
      const { data: interactions } = await supabase
        .from('notebook_interactions')
        .select('*')
        .limit(1000);

      if (!interactions || interactions.length === 0) {
        warnings.push('No interaction data available for performance analysis');
        score -= 10;
      }

      // Simulate performance checks
      const queryStartTime = Date.now();
      await supabase
        .from('notebooks')
        .select('id, title, quality_score')
        .limit(100);
      const queryDuration = Date.now() - queryStartTime;

      if (queryDuration > 1000) {
        warnings.push('Database queries are slower than expected');
        score -= 15;
      }

    } catch (error) {
      errors.push('Failed to validate performance metrics');
      score -= 25;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Accessibility Validation
  static validateAccessibility(componentHtml: string): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    // Check for alt text on images
    const imgTags = componentHtml.match(/<img[^>]*>/g) || [];
    const imgsWithoutAlt = imgTags.filter(img => !img.includes('alt='));
    if (imgsWithoutAlt.length > 0) {
      errors.push(`${imgsWithoutAlt.length} images missing alt text`);
      score -= imgsWithoutAlt.length * 10;
    }

    // Check for proper heading hierarchy
    const headings = componentHtml.match(/<h[1-6][^>]*>/g) || [];
    if (headings.length > 0) {
      const levels = headings.map(h => parseInt(h.match(/h([1-6])/)?.[1] || '1'));
      for (let i = 1; i < levels.length; i++) {
        if (levels[i] - levels[i-1] > 1) {
          warnings.push('Heading hierarchy may be skipping levels');
          score -= 5;
          break;
        }
      }
    }

    // Check for color contrast (simplified check)
    const colorStyles = componentHtml.match(/color:\s*[^;]+/g) || [];
    if (colorStyles.some(style => style.includes('gray') || style.includes('#ccc'))) {
      warnings.push('Potential color contrast issues detected');
      score -= 5;
    }

    // Check for keyboard navigation support
    const interactiveElements = componentHtml.match(/<(button|input|select|textarea|a)[^>]*>/g) || [];
    const elementsWithoutTabIndex = interactiveElements.filter(el => 
      !el.includes('tabindex') && !el.includes('disabled')
    );
    if (elementsWithoutTabIndex.length > 0) {
      warnings.push('Some interactive elements may not be keyboard accessible');
      score -= 5;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Data Integrity Validation
  static async validateDataIntegrity(): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    try {
      // Check for orphaned records
      const { data: orphanedRecommendations } = await supabase
        .from('ai_recommendations')
        .select('id, user_id')
        .limit(100);

      if (orphanedRecommendations && orphanedRecommendations.length > 0) {
        // Check if users exist for these recommendations
        const userIds = orphanedRecommendations.map(r => r.user_id);
        const { data: existingUsers } = await supabase
          .from('profiles')
          .select('id')
          .in('id', userIds);

        const existingUserIds = new Set(existingUsers?.map(u => u.id) || []);
        const orphanedCount = orphanedRecommendations.filter(r => !existingUserIds.has(r.user_id)).length;

        if (orphanedCount > 0) {
          warnings.push(`${orphanedCount} orphaned recommendation records`);
          score -= 10;
        }
      }

      // Check for data consistency
      const { data: teamsWithoutOwners } = await supabase
        .from('teams')
        .select(`
          id,
          team_members!inner(role)
        `)
        .not('team_members.role', 'eq', 'owner');

      if (teamsWithoutOwners && teamsWithoutOwners.length > 0) {
        errors.push(`${teamsWithoutOwners.length} teams without proper ownership`);
        score -= 20;
      }

    } catch (error) {
      errors.push('Failed to validate data integrity');
      score -= 25;
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, score)
    };
  }

  // Helper method to detect suspicious activity
  private static detectSuspiciousActivity(activities: any[]): string[] {
    const patterns: string[] = [];
    
    // Check for rapid successive actions
    const rapidActions = activities.filter((activity, index) => {
      if (index === 0) return false;
      const timeDiff = new Date(activities[index-1].created_at).getTime() - 
                      new Date(activity.created_at).getTime();
      return timeDiff < 1000; // Less than 1 second apart
    });

    if (rapidActions.length > 5) {
      patterns.push('Rapid successive actions detected');
    }

    // Check for unusual action patterns
    const actionCounts = activities.reduce((acc, activity) => {
      acc[activity.action] = (acc[activity.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (actionCounts.DELETE > actionCounts.INSERT * 2) {
      patterns.push('Unusual deletion pattern detected');
    }

    return patterns;
  }

  // Comprehensive system health check
  static async performSystemHealthCheck(): Promise<{
    overall: ValidationResult;
    components: {
      security: ValidationResult;
      performance: ValidationResult;
      dataIntegrity: ValidationResult;
      aiModel: AIModelAudit;
    };
  }> {
    const [security, performance, dataIntegrity] = await Promise.all([
      this.validateSecurityCompliance(),
      this.validatePerformance(),
      this.validateDataIntegrity()
    ]);

    const aiModel = await this.auditAIModel('recommendation-engine');

    const overallScore = (security.score + performance.score + dataIntegrity.score) / 3;
    const allErrors = [...security.errors, ...performance.errors, ...dataIntegrity.errors];
    const allWarnings = [...security.warnings, ...performance.warnings, ...dataIntegrity.warnings];

    return {
      overall: {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings,
        score: overallScore
      },
      components: {
        security,
        performance,
        dataIntegrity,
        aiModel
      }
    };
  }
}