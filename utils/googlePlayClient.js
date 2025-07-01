const { androidpublisher } = require('@googleapis/androidpublisher');

// Initialize the Google Play Developer API client
const initAndroidPublisher = () => {
  try {
    // Get service account credentials from environment variable
    const credentials = JSON.parse(process.env.GOOGLE_PLAY_CREDENTIALS);
    
    // Create JWT client
    const auth = new google.auth.JWT(
      credentials.client_email,
      null,
      credentials.private_key,
      ['https://www.googleapis.com/auth/androidpublisher'],
      null
    );

    return { auth, androidpublisher };
  } catch (error) {
    console.error('Error initializing Google Play API client:', error);
    throw new Error('Failed to initialize Google Play API client');
  }
};

// Verify subscription with Google Play
const verifySubscription = async (packageName, subscriptionId, purchaseToken) => {
  try {
    const { auth, androidpublisher } = initAndroidPublisher();
    
    // Get the subscription details
    const res = await androidpublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
      auth
    });

    return {
      valid: true,
      expiryTimeMillis: parseInt(res.data.expiryTimeMillis),
      startTimeMillis: parseInt(res.data.startTimeMillis),
      autoRenewing: res.data.autoRenewing,
      paymentState: res.data.paymentState,
      orderId: res.data.orderId
    };
  } catch (error) {
    console.error('Error verifying subscription:', error.message);
    return {
      valid: false,
      error: error.message,
      code: error.code
    };
  }
};

// Check if subscription is active
const isSubscriptionActive = (subscription) => {
  if (!subscription || !subscription.valid) return false;
  
  const now = Date.now();
  const expiryTime = parseInt(subscription.expiryTimeMillis);
  
  // Consider subscription valid if it expires in the future
  return expiryTime > now;
};

module.exports = {
  verifySubscription,
  isSubscriptionActive,
  initAndroidPublisher
};
