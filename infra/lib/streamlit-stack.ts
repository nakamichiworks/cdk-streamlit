import * as cdk from 'aws-cdk-lib';
import { aws_ecs as ecs } from 'aws-cdk-lib';
import { aws_ecs_patterns as ecs_patterns } from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from 'aws-cdk-lib';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets';
import { Construct } from 'constructs';

export class StreamlitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc');

    const dockerImage = new DockerImageAsset(this, 'StreamlitDockerImage', {
      directory: '..',
      file: 'Dockerfile',
    });

    const cluster = new ecs.Cluster(this, 'StreamlitCluster', { vpc });

    const service = new ecs_patterns.ApplicationLoadBalancedFargateService(this, 'StreamlitService', {
      cluster,
      cpu: 256,
      desiredCount: 1,
      taskImageOptions: {
        image: ecs.ContainerImage.fromDockerImageAsset(dockerImage),
        containerPort: 8501,
      },
      memoryLimitMiB: 512,
      publicLoadBalancer: true,
    });

    new cdk.CfnOutput(this, "StreamlitServiceUrl", { value: service.loadBalancer.loadBalancerDnsName })
  }
}
