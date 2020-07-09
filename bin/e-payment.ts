#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { EPaymentStack } from '../lib/e-payment-stack';

const app = new cdk.App();
new EPaymentStack(app, 'EPaymentStack');
