import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { VerwerkingenApiStack } from './VerwerkingenApiStack';

export interface VerwerkingenApiStageProps extends StageProps {
  branch: string;
}

/**
 * Stage responsible for the API Gateway and lambdas
 */
export class VerwerkingenApiStage extends Stage {
  constructor(scope: Construct, id: string, props: VerwerkingenApiStageProps) {
    super(scope, id, props);

    new VerwerkingenApiStack(this, 'verwerkingen-api');
  }
}