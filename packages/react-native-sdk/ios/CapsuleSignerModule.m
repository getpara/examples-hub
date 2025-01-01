//
//  CapsuleSignerModule.m
//
//  Created by Michał Osadnik on 14/12/2022.
//

#import <Foundation/Foundation.h>
#import "CapsuleSignerModule.h"
#import <Signer/Signer.h>
#import <CommonCrypto/CommonCrypto.h>

static NSString *configBase = @"{\"ServerUrl\": \"%@\", \"WalletId\": \"%@\", \"Id\":\"%@\", \"Ids\":%@, \"Threshold\":1}";
static NSString *configDKLSBase = @"{\"walletId\": \"%@\", \"id\":\"USER\", \"otherId\":\"CAPSULE\", \"isReceiver\": false}";

static NSString *ids = @"[\"USER\",\"CAPSULE\"]";

@implementation CapsuleSignerModule {
  NSString *_serverUrl;
  NSString *_wsServerUrl;
}

+ (BOOL)requiresMainQueueSetup
{
  return YES;
}

- (dispatch_queue_t)methodQueue {
  return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setServerUrl: (NSString *) serverUrl) {
  _serverUrl = serverUrl;
}

RCT_EXPORT_METHOD(setWsServerUrl: (NSString *) wsServerUrl) {
  _wsServerUrl = wsServerUrl;
}

- (NSString*) getServerAddress:(NSString*) userID {
  return [NSString stringWithFormat:@"%@users/%@/mpc-network", _serverUrl, userID];
}

- (NSString*) getWSServerAddress {
  return [NSString stringWithFormat:@"%@", _wsServerUrl];
}

// Get Address
- (void) invokeSignerGetAddress:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerGetAddress(serializedSigner);
  resolve(res);
}

RCT_EXPORT_METHOD(getAddress:(NSString *)serializedSigner
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerGetAddress:)
                         withObject:params];
}

// Send Transaction
- (void) invokeSignerSendTransaction:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* transaction = [params objectForKey:@"transaction"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerSendTransaction([self getServerAddress:userId], serializedSigner, transaction, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(sendTransaction:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  transaction:(NSString *)transaction
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          transaction, @"transaction",
                          protocolId, @"protocolId",
                          userId, @"userId",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerSendTransaction:)
                         withObject:params];
}


// Sign Message
- (void) invokeSignerSignMessage:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* message = [params objectForKey:@"message"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerSignMessage([self getServerAddress:userId], serializedSigner, message, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(signMessage:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  message:(NSString *)message
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          message, @"message",
                          protocolId, @"protocolId",
                          userId, @"userId",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerSignMessage:)
                         withObject:params];
}

// Create Account
- (void) invokeSignerCreateAccount:(NSDictionary*)params
{
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  NSString* signerConfig = [params objectForKey:@"signerConfig"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];
  NSString* res = SignerCreateAccount([self getServerAddress:userId],signerConfig, protocolId);

  resolve(res);
}


RCT_EXPORT_METHOD(createAccount:(NSString *)walletId
                  protocolId:(NSString *)protocolId
                  shareType:(NSString *)shareType
                  userId:(NSString *)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSLog([self getServerAddress:userId]);
  NSString* signerConfig = [NSString stringWithFormat: configBase, [self getServerAddress:userId], walletId, shareType, ids];
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          protocolId, @"protocolId",
                          userId, @"userId",
                          resolve, @"resolve",
                          signerConfig, @"signerConfig",
                          nil];


  [self performSelectorInBackground:@selector(invokeSignerCreateAccount:)
                         withObject:params];
}


// Key Refresh
- (void) invokeSignerRefresh:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerRefresh([self getServerAddress:userId], serializedSigner, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(refresh:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          serializedSigner, @"serializedSigner",
                          userId, @"userId",
                          resolve, @"resolve",
                          protocolId, @"protocolId",
                          nil];


  [self performSelectorInBackground:@selector(invokeSignerRefresh:)
                         withObject:params];
}

- (void) invokeSignerDKLSGetAddress:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerDKLSGetAddress(serializedSigner);
  resolve(res);
}

RCT_EXPORT_METHOD(dklsGetAddress:(NSString *)serializedSigner
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerDKLSGetAddress:)
                         withObject:params];
}

- (void) invokeSignerDKLSSendTransaction:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* transaction = [params objectForKey:@"transaction"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerDKLSSendTransaction([self getWSServerAddress], serializedSigner, transaction, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(dklsSendTransaction:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  transaction:(NSString *)transaction
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          transaction, @"transaction",
                          protocolId, @"protocolId",
                          userId, @"userId",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerDKLSSendTransaction:)
                         withObject:params];
}

- (void) invokeSignerDKLSSignMessage:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* message = [params objectForKey:@"message"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerDKLSSignMessage([self getWSServerAddress], serializedSigner, message, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(dklsSignMessage:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  message:(NSString *)message
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          message, @"message",
                          protocolId, @"protocolId",
                          userId, @"userId",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerDKLSSignMessage:)
                         withObject:params];
}

- (void) invokeSignerDKLSCreateAccount:(NSDictionary*)params
{
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  NSString* signerConfig = [params objectForKey:@"signerConfig"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];
  NSString* res = SignerDKLSCreateAccount([self getWSServerAddress],signerConfig, protocolId);

  resolve(res);
}


RCT_EXPORT_METHOD(dklsCreateAccount:(NSString *)walletId
                  protocolId:(NSString *)protocolId
                  shareType:(NSString *)shareType
                  userId:(NSString *)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSLog([self getWSServerAddress]);
  NSString* signerConfig = [NSString stringWithFormat: configDKLSBase, walletId];
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          protocolId, @"protocolId",
                          userId, @"userId",
                          resolve, @"resolve",
                          signerConfig, @"signerConfig",
                          nil];


  [self performSelectorInBackground:@selector(invokeSignerDKLSCreateAccount:)
                         withObject:params];
}

- (void) invokeSignerDKLSRefresh:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  NSString* userId = [params objectForKey:@"userId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerDKLSRefresh([self getWSServerAddress], serializedSigner, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(dklsRefresh:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  userId:(NSString*)userId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          serializedSigner, @"serializedSigner",
                          userId, @"userId",
                          resolve, @"resolve",
                          protocolId, @"protocolId",
                          nil];


  [self performSelectorInBackground:@selector(invokeSignerDKLSRefresh:)
                         withObject:params];
}

- (void) invokeSignerED25519CreateAccount:(NSDictionary*)params
{
  NSString* walletId = [params objectForKey:@"walletId"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];
  NSString* res = SignerED25519CreateAccount([self getWSServerAddress], walletId, protocolId);

  resolve(res);
}


RCT_EXPORT_METHOD(ed25519CreateAccount:(NSString *)walletId
                  protocolId:(NSString *)protocolId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  NSLog([self getWSServerAddress]);
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          walletId, @"walletId",
                          protocolId, @"protocolId",
                          resolve, @"resolve",
                          nil];


  [self performSelectorInBackground:@selector(invokeSignerED25519CreateAccount:)
                         withObject:params];
}

- (void) invokeSignerED25519Sign:(NSDictionary*)params
{
  NSString* serializedSigner = [params objectForKey:@"serializedSigner"];
  NSString* message = [params objectForKey:@"message"];
  NSString* protocolId = [params objectForKey:@"protocolId"];
  RCTPromiseResolveBlock resolve = [params objectForKey:@"resolve"];

  NSString* res = SignerED25519Sign(serializedSigner, message, protocolId);
  resolve(res);
}

RCT_EXPORT_METHOD(ed25519Sign:(NSString*)protocolId
                  serializedSigner:(NSString *)serializedSigner
                  message:(NSString *)message
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

{
  NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:
                          resolve, @"resolve",
                          serializedSigner, @"serializedSigner",
                          message, @"message",
                          protocolId, @"protocolId",
                          nil];
  [self performSelectorInBackground:@selector(invokeSignerED25519Sign:)
                         withObject:params];
}

// Don't compile this code when we build for the old architecture.
// #ifdef RCT_NEW_ARCH_ENABLED
// - (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
//     (const facebook::react::ObjCTurboModule::InitParams &)params
// {
//     return std::make_shared<facebook::react::NativeReactNativeWalletSpecJSI>(params);
// }
// #endif

@end
