const PICTORY_CLIENT_ID = process.env.PICTORY_CLIENT_ID as string ;

export async function renderVideo({ audio, output, scenes, client_token }: any) {
  
  var raw = {
    audio,
    output,
    scenes,
    next_generation_video: true,
    containsTextToImage: true,
  };

  var requestOptions: RequestInit = {
    method: "POST",
    headers: {
      "Authorization": `${client_token}`,
      "X-Pictory-User-Id": `${PICTORY_CLIENT_ID}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(raw),
  };

  const data = await fetch("https://api.pictory.ai/pictoryapis/v1/video/render", requestOptions)
  const dataJSON = await data.json();

  return dataJSON;
}