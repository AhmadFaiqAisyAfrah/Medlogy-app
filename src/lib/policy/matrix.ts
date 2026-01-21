/**
 * Deterministic Policy Matrix
 * Maps observational data (Risk, Trend, Sentiment) to Operational Status.
 * Strictly Read-Only Logic. No AI generation.
 */

export type MonitoringLevel = 'routine' | 'enhanced' | 'active_response';
export type AdvisoryCode = 'green' | 'yellow' | 'orange' | 'red';

export interface PolicyStatusOutput {
    monitoring_level: MonitoringLevel;
    advisory_code: AdvisoryCode;
    reasoning: string;
    recommended_actions: string[];
}

interface MatrixInput {
    risk_level: string; // 'low' | 'medium' | 'high' | 'critical'
    case_trend: 'increasing' | 'decreasing' | 'stable' | 'unknown';
    severity_score: number; // calculated from signal_metrics
}

export function calculatePolicyStatus(input: MatrixInput): PolicyStatusOutput {
    // 1. Base Logic: High Risk + Increasing Trend = Red/Active
    if (input.risk_level === 'critical') {
        return {
            monitoring_level: 'active_response',
            advisory_code: 'red',
            reasoning: 'Critical risk classification requires immediate active response posture.',
            recommended_actions: [
                'Activate Emergency Operations Center (EOC)',
                'Daily situational reports required',
                'Mobilize rapid response teams'
            ]
        };
    }

    if (input.risk_level === 'high') {
        if (input.case_trend === 'increasing' || input.severity_score > 5) {
            return {
                monitoring_level: 'active_response',
                advisory_code: 'orange',
                reasoning: 'High risk pathogen with escalating transmission or critical signal severity.',
                recommended_actions: [
                    'Increase surveillance frequency to 4-hour intervals',
                    'Prepare isolation capacity',
                    'Issue public health advisories'
                ]
            };
        }
        return {
            monitoring_level: 'enhanced',
            advisory_code: 'yellow',
            reasoning: 'High risk pathogen detected but transmission indicators are currently stable.',
            recommended_actions: [
                'Enhanced surveillance active',
                'Monitor cross-border transmission'
            ]
        };
    }

    if (input.risk_level === 'medium') {
        if (input.case_trend === 'increasing') {
            return {
                monitoring_level: 'enhanced',
                advisory_code: 'yellow',
                reasoning: 'Medium risk pathogen showing upward transmission trend.',
                recommended_actions: [
                    'Review case definitions',
                    'Alert regional health offices'
                ]
            };
        }
        return {
            monitoring_level: 'routine',
            advisory_code: 'green',
            reasoning: 'Medium risk pathogen with stable or decreasing transmission.',
            recommended_actions: [
                'Routine sentinel surveillance',
                'Weekly reporting cycle'
            ]
        };
    }

    // Low Risk & Default
    if (input.case_trend === 'increasing') {
        return {
            monitoring_level: 'enhanced',
            advisory_code: 'yellow',
            reasoning: 'Low risk pathogen showing unexpected transmission increase.',
            recommended_actions: [
                'Investigate potential new variants',
                'Verify data quality'
            ]
        };
    }

    return {
        monitoring_level: 'routine',
        advisory_code: 'green',
        reasoning: 'Baseline surveillance. No critical indicators detected.',
        recommended_actions: [
            'Standard reporting duties',
            'Maintain sentinel monitoring'
        ]
    };
}
