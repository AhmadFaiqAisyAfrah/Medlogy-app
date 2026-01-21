import { describe, it, expect } from 'vitest';
import { calculatePolicyStatus } from './matrix';

describe('Policy Matrix Logic', () => {
    it('should return RED/ACTIVE for Critical risk', () => {
        const result = calculatePolicyStatus({
            risk_level: 'critical',
            case_trend: 'increasing',
            severity_score: 8
        });
        expect(result.monitoring_level).toBe('active_response');
        expect(result.advisory_code).toBe('red');
        expect(result.recommended_actions).toContain('Activate Emergency Operations Center (EOC)');
    });

    it('should return ORANGE/ACTIVE for High risk + Increasing trend', () => {
        const result = calculatePolicyStatus({
            risk_level: 'high',
            case_trend: 'increasing',
            severity_score: 6
        });
        expect(result.monitoring_level).toBe('active_response'); // escalating
        expect(result.advisory_code).toBe('orange');
    });

    it('should return YELLOW/ENHANCED for High risk + Stable trend', () => {
        const result = calculatePolicyStatus({
            risk_level: 'high',
            case_trend: 'stable',
            severity_score: 4
        });
        expect(result.monitoring_level).toBe('enhanced');
        expect(result.advisory_code).toBe('yellow');
    });

    it('should return GREEN/ROUTINE for Low risk + Stable trend', () => {
        const result = calculatePolicyStatus({
            risk_level: 'low',
            case_trend: 'stable',
            severity_score: 2
        });
        expect(result.monitoring_level).toBe('routine');
        expect(result.advisory_code).toBe('green');
    });
});
