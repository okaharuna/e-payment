#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EPaymentStack } from '../lib/e-payment-stack';
import { InfraInitStack } from '../lib/infra-init-stack';

const app = new cdk.App();
new EPaymentStack(app, 'EPaymentStack');
new InfraInitStack(app, 'InfraInitStack');
