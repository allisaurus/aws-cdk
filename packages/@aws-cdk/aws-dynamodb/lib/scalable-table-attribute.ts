import appscaling = require('@aws-cdk/aws-applicationautoscaling');
import { UtilizationScalingProps } from './scalable-attribute-api';

/**
 * A scalable table attribute
 */
export class ScalableTableAttribute extends appscaling.BaseScalableAttribute {
  /**
   * Scale out or in based on time
   */
  public scaleOnSchedule(id: string, action: appscaling.ScalingSchedule) {
    super.doScaleOnSchedule(id, action);
  }

  /**
   * Scale out or in to keep utilization at a given level
   */
  public scaleOnUtilization(props: UtilizationScalingProps) {
    if (props.targetUtilizationPercent < 10 || props.targetUtilizationPercent > 90) {
      // tslint:disable-next-line:max-line-length
      throw new RangeError(`targetUtilizationPercent for DynamoDB scaling must be between 10 and 90 percent, got: ${props.targetUtilizationPercent}`);
    }
    const predefinedMetric = this.props.dimension.indexOf('ReadCapacity') === -1
        ? appscaling.PredefinedMetric.DynamoDBWriteCapacityUtilization
        : appscaling.PredefinedMetric.DynamoDBReadCapacityUtilization;

    super.doScaleToTrackMetric('Tracking', {
      policyName: props.policyName,
      disableScaleIn: props.disableScaleIn,
      scaleInCooldownSec: props.scaleInCooldownSec,
      scaleOutCooldownSec: props.scaleOutCooldownSec,
      targetValue: props.targetUtilizationPercent,
      predefinedMetric,
    });
  }
}

/**
 * Properties for enabling DynamoDB capacity scaling
 */
export interface EnableScalingProps {
  /**
   * Minimum capacity to scale to
   */
  minCapacity: number;

  /**
   * Maximum capacity to scale to
   */
  maxCapacity: number;
}
