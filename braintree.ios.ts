/**
 * @Author: jibon
 * @Date:   2017-08-25T12:29:38+08:00
 * @Last modified by:   jibon
 * @Last modified time: 2017-08-30T13:46:28+08:00
 */

import { Common } from './braintree.common';
import * as utils from "tns-core-modules/utils/utils";

declare var BTDropInRequest, BTDropInController, UIApplication, PPDataCollector;

export class Braintree extends Common {

  public output = {
    'status': 'fail',
    'msg': 'unknown',
    'nonce': '',
    'paymentMethodType': '',
    'deviceInfo': ''
  }
  public startPayment(token: any, options: BrainTreeOptions) {

    let t = this;

    return new Promise(function(resolve, reject) {

      let request = BTDropInRequest.alloc().init();

      if (options.amount) {
        request.amount = options.amount;
      }
      if (options.collectDeviceData) {
        request.collectDeviceData = true;
      }
      if (options.requestThreeDSecureVerification) {
        request.threeDSecureVerification = true;
      }
      let dropIn = BTDropInController.alloc().initWithAuthorizationRequestHandler(token, request, function(controller, result, error) {
        if (error !== null) {

          setTimeout(function() {
            reject(t.output);
          }, 500);

        } else if (result.cancelled) {
          t.output.status = 'cancelled';
          t.output.msg = 'User has cancelled payment';
          setTimeout(function() {
            reject(t.output);
          }, 500);

        } else {
          t.output.status = 'success';
          t.output.msg = 'Got Payment Nonce Value';
          t.output.nonce = result.paymentMethod.nonce;
          t.output.paymentMethodType = result.paymentMethod.type;
          t.output.deviceInfo = PPDataCollector.collectPayPalDeviceData();

          setTimeout(function() {
            resolve(t.output);
          }, 500);
        }
        controller.dismissViewControllerAnimatedCompletion(true, null);
      });

      let app = utils.ios.getter(UIApplication, UIApplication.sharedApplication);
      app.keyWindow.rootViewController.presentViewControllerAnimatedCompletion(dropIn, true, null);
    })
  }

}

export interface BrainTreeOptions {
  amount: string;
  collectDeviceData?: boolean;
  requestThreeDSecureVerification?: boolean;
}
