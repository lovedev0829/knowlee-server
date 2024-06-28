import * as SibApiV3Sdk from "@sendinblue/client";
// Configure API key authorization: apiKey
const BREVO_API_KEY = process.env.BREVO_API_KEY as string;

const brevoContactInstance = new SibApiV3Sdk.ContactsApi();

brevoContactInstance.setApiKey(
  SibApiV3Sdk.ContactsApiApiKeys.apiKey,
  BREVO_API_KEY
);

export const brevoCreateContact = async (
  contact: SibApiV3Sdk.CreateContact,
  options?: any
) => {
  try {
    const response = await brevoContactInstance.createContact(contact, options);
    return response;
  } catch (error) { 
    console.error('Error when calling creating contact: ', error);
    return null;
  }
};

export const brevoUpdateContact = async (
  identifier: string,
  updateContact: SibApiV3Sdk.UpdateContact,
  options?: any
) => {
  try {
    const response = await brevoContactInstance.updateContact(
      identifier,
      updateContact,
      options
    );
    return response;
  } catch (error) {
    console.error('Error when calling updating contact: ', error);
    return null;
  }
};

export const brevoGetContact = async (identifier: string) => {
  try {
      const response = await brevoContactInstance.getContactInfo(identifier);
      ////console.log('API called successfully. Returned data: ' + JSON.stringify(response));
      return response;
  } catch (error) {
      console.error('Error when calling getContactInfo: ', error);
      // Depending on how you want to handle errors, you might throw the error,
      // return null, or handle it in some other way.
      return null;
  }
};

export default brevoContactInstance