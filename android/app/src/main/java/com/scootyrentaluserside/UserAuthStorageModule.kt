package com.scootyrentaluserside

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class UserAuthStorageModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

  private val prefs by lazy {
    reactContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
  }

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun setItem(key: String, value: String, promise: Promise) {
    try {
      prefs.edit().putString(key, value).apply()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("USER_AUTH_STORAGE_SET_FAILED", error)
    }
  }

  @ReactMethod
  fun getItem(key: String, promise: Promise) {
    try {
      promise.resolve(prefs.getString(key, null))
    } catch (error: Exception) {
      promise.reject("USER_AUTH_STORAGE_GET_FAILED", error)
    }
  }

  @ReactMethod
  fun removeItem(key: String, promise: Promise) {
    try {
      prefs.edit().remove(key).apply()
      promise.resolve(null)
    } catch (error: Exception) {
      promise.reject("USER_AUTH_STORAGE_REMOVE_FAILED", error)
    }
  }

  companion object {
    private const val MODULE_NAME = "UserAuthStorage"
    private const val PREFS_NAME = "user_auth_storage"
  }
}
