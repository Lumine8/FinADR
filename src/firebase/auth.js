// src/firebase/auth.js
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase.js';
import axios from 'axios';

export const authenticateWithSecuADR = async (gestureData) => {
  try {
    // Call SecuADR authentication
    const response = await axios.post('http://localhost:5000/api/authenticate', {
      cnnConfidence: gestureData.cnnConfidence,
      dollarScore: gestureData.dollarScore,
      username: gestureData.username,
      metadata: gestureData.metadata
    });

    if (response.data.success && response.data.firebaseToken) {
      // Sign in to Firebase with custom token
      const userCredential = await signInWithCustomToken(auth, response.data.firebaseToken);
      const user = userCredential.user;
      
      console.log('✅ Authenticated with SecuADR + Firebase:', user.uid);
      
      return {
        success: true,
        user: user,
        secuAdrData: response.data
      };
    } else {
      return {
        success: false,
        message: response.data.details,
        tips: response.data.improvementTips
      };
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: error.message };
  }
};
