import axios from "axios";

const MICROSOFT_GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

//Get users notebooks
export async function getUsersNotebooks({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/notebooks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }


  //Get users onenote sections
export async function getUsersNoteBookSections({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/sections`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }


//Get users onenote pages
export async function getUsersNoteBookPages({
    token,
  }: {
    token: string;
  }) {
    
    const response = await axios.get(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/pages`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.data?.value;
  }

//Create  users onenote Notebooks
export async function outlookOneNoteBookCreate({
    token,
    ...params
  }: {
    token: string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/notebooks`,
      params,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.status;
  }

//Create OneNoteBook Section
export async function outlookOneNoteBookSectionCreate({
    token,
    notebookId,
    displayName
  }: {
    token: string;
    notebookId:string;
    displayName:string;
  }) {
    
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/notebooks/${notebookId}/sections`,
      {
        displayName: displayName
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );
    
    return response?.status;
  }

  //Create OneNoteBook Section
export async function outlookOneNoteUsersPageCreate({
    token,
    sectionId,
    pageContent
  }: {
    token: string;
    sectionId:string;
    pageContent:string;
  }) {
    const response = await axios.post(
      `${MICROSOFT_GRAPH_BASE_URL}/me/onenote/sections/${sectionId}/pages`,
      pageContent,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/html',
        },
      },
    );
    
    return response?.status;
  }