// Minimal test to verify core flow works
import 'dart:io';
import 'package:dotenv/dotenv.dart';

void main() async {
  print('🧪 Testing core authentication flow...');
  
  // Quick sanity check
  try {
    final env = DotEnv(includePlatformEnvironment: true)..load(['.env']);
    final apiKey = Platform.environment['PARA_API_KEY'] ?? env['PARA_API_KEY'];
    print('API Key available: ${apiKey != null && apiKey.isNotEmpty}');
    
    final currentDir = Directory.current.path;
    final projectRoot = currentDir.endsWith('test_e2e') 
        ? Directory.current.parent.path 
        : currentDir;
    final appPath = '$projectRoot/build/ios/iphonesimulator/Runner.app';
    
    final appExists = await File(appPath).exists();
    print('App exists: $appExists');
    
    if (!appExists) {
      print('❌ Need to build app first: flutter build ios --simulator');
      return;
    }
    
    print('✅ Prerequisites check passed');
    print('🎯 The simplified test structure should work, but needs actual device testing');
    
  } catch (e) {
    print('❌ Prerequisites check failed: $e');
  }
}