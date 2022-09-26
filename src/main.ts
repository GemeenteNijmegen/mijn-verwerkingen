import { App } from 'aws-cdk-lib';
import { PipelineStack } from './PipelineStack';

// for development, use sandbox account
const deploymentEnvironment = {
  account: '418648875085',
  region: 'eu-west-1',
};

const acceptanceEnvironment = {
  account: '315037222840',
  region: 'eu-west-1',
};

const app = new App();

if (process.env.BRANCH_NAME == 'acceptance' || process.env.BRANCH_NAME == undefined) {
  new PipelineStack(app, 'mijn-verwerkingen-pipeline-acceptance',
    {
      env: deploymentEnvironment,
      branchName: 'acceptance',
      deployToEnvironment: acceptanceEnvironment,
    },
  );
}

app.synth();