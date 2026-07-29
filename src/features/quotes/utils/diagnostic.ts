import { quoteService } from '@/services/quoteService';

export async function verifyAndInitializeQuotesDatabase() {
  try {
    console.log('Verifying Quotes Google Sheets backend...');
    const response = await quoteService.verifyAndSetupSheets();
    
    if (response.success) {
      console.log('Quotes database sheets verified and initialized successfully.', response.data);
      return {
        success: true,
        message: 'Google Sheets successfully verified and initialized.',
        details: response.data
      };
    } else {
      console.error('Failed to verify/initialize quotes database:', response.message);
      return {
        success: false,
        message: response.message,
        details: response.error
      };
    }
  } catch (error) {
    console.error('Error during quotes database diagnostic:', error);
    return {
      success: false,
      message: 'Network or configuration error while attempting to connect to Google Apps Script.',
      details: error
    };
  }
}
