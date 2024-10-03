package com.capsule.reactnativewallet;

import android.util.Log;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;
import signer.Signer;

public class CapsuleSignerModule extends ReactContextBaseJavaModule {
  static final String TAG = "CapsuleSignerModule";

  String ids = "[\"USER\",\"CAPSULE\"]";
  String serverUrl;
  String wsServerUrl;
  String configBase =
    "{\"ServerUrl\": \"%s\", \"WalletId\": \"%s\", \"Id\":\"%s\", \"Ids\":%s, \"Threshold\":1}";
  String configDKLSBase =
    "{\"walletId\": \"%s\", \"id\":\"USER\", \"otherId\":\"CAPSULE\", \"isReceiver\": false}";

  CapsuleSignerModule(ReactApplicationContext context) {
    super(context);
  }

  @Override
  public String getName() {
    return "CapsuleSignerModule";
  }

  @ReactMethod
  public void setServerUrl(String serverUrl) {
    this.serverUrl = serverUrl;
  }

  @ReactMethod
  public void setWsServerUrl(String wsServerUrl) {
    this.wsServerUrl = wsServerUrl;
  }

  private String getServerAddress(String userID) {
    return String.format("%susers/%s/mpc-network", this.serverUrl, userID);
  }

  private String getWsServerAddress() {
    return this.wsServerUrl;
  }

  /**
   * Perform distributed key generation with the Capsule server
   *
   * @param protocolId
   * @return
   */
  @ReactMethod
  public void createAccount(
    String walletId,
    String protocolId,
    String id,
    String userId,
    Promise promise
  ) {
    String signerConfig = String.format(
      configBase,
      this.getServerAddress(userId),
      walletId,
      id,
      ids
    );
    (
      new Thread(
        () -> {
          String res = Signer.createAccount(
            this.getServerAddress(userId),
            signerConfig,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void getAddress(String serializedSigner, Promise promise) {
    (
      new Thread(
        () -> {
          String res = Signer.getAddress(serializedSigner);
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void sendTransaction(
    String protocolId,
    String serializedSigner,
    String transaction,
    String userId,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.sendTransaction(
            this.getServerAddress(userId),
            serializedSigner,
            transaction,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void signMessage(
    String protocolId,
    String serializedSigner,
    String message,
    String userId,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.signMessage(
            this.getServerAddress(userId),
            serializedSigner,
            message,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void refresh(String protocolId, String serializedSigner, String userId, Promise promise) {
    (
      new Thread(
        () -> {
          String res = Signer.refresh(this.getServerAddress(userId), serializedSigner, protocolId);
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void dklsCreateAccount(
    String walletId,
    String protocolId,
    String id,
    String userId,
    Promise promise
  ) {
    String signerConfig = String.format(
      configDKLSBase,
      walletId
    );
    (
      new Thread(
        () -> {
          String res = Signer.dklsCreateAccount(
            this.getWsServerAddress(),
            signerConfig,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void dklsGetAddress(String serializedSigner, Promise promise) {
    (
      new Thread(
        () -> {
          String res = Signer.dklsGetAddress(serializedSigner);
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void dklsSendTransaction(
    String protocolId,
    String serializedSigner,
    String transaction,
    String userId,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.dklsSendTransaction(
            this.getWsServerAddress(),
            serializedSigner,
            transaction,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void dklsSignMessage(
    String protocolId,
    String serializedSigner,
    String message,
    String userId,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.dklsSignMessage(
            this.getWsServerAddress(),
            serializedSigner,
            message,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void dklsRefresh(String protocolId, String serializedSigner, String userId, Promise promise) {
    (
      new Thread(
        () -> {
          String res = Signer.dklsRefresh(this.getWsServerAddress(), serializedSigner, protocolId);
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void ed25519CreateAccount(
    String walletId,
    String protocolId,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.eD25519CreateAccount(
            this.getWsServerAddress(),
            walletId,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }

  @ReactMethod
  public void ed25519Sign(
    String protocolId,
    String serializedSigner,
    String message,
    Promise promise
  ) {
    (
      new Thread(
        () -> {
          String res = Signer.eD25519Sign(
            serializedSigner,
            message,
            protocolId
          );
          promise.resolve(res);
        }
      )
    ).start();
  }
}
