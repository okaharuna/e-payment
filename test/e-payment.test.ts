import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as EPayment from '../lib/e-payment-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new EPayment.EPaymentStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
