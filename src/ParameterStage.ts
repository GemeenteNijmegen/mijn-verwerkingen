import { Stack, Tags, Stage, aws_ssm as SSM, aws_secretsmanager as SecretsManager, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Statics } from './statics';

/**
 * Stage for creating SSM parameters. This needs to run
 * before stages that use them.
 */

export class ParameterStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    new ParameterStack(this, 'params');
  }
}
/**
 * Stack that creates ssm parameters for the application.
 * These need to be present before stack that use them.
 */

export class ParameterStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    new ssmParamsConstruct(this, 'plain');
  }
}
/**
 * All SSM parameters needed for the application.
 * Some are created with a sensible default, others are
 * empty and need to be filled or changed via the console.
 */

export class ssmParamsConstruct extends Construct {

  constructor(scope: Construct, id: string) {
    super(scope, id);
    Tags.of(this).add('cdkManaged', 'yes');
    Tags.of(this).add('Project', Statics.projectName);

    new SecretsManager.Secret(this, 'secret_1', {
      secretName: Statics.ssmVerwerkingenApiKey,
      description: 'Verwerkingen logging Api key',
    });

    new SSM.StringParameter(this, 'ssm_verwerkingen_1', {
      stringValue: 'https://g423bazyr0.execute-api.eu-west-1.amazonaws.com/dev/',
      parameterName: Statics.ssmVerwerkingenApiEndpointUrl,
    });

  }
}
