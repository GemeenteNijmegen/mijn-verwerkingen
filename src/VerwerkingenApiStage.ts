import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VerwerkingenApiStack } from './VerwerkingenApiStack';

export interface GegevensApiStageProps extends StageProps {
  branch: string;
}

/**
 * Stage responsible for the API Gateway and lambdas
 */
export class VerwerkingenApiStage extends Stage {
  constructor(scope: Construct, id: string, props: GegevensApiStageProps) {
    super(scope, id, props);

    new VerwerkingenApiStack(this, 'persoonsgegevens-api');
  }
}