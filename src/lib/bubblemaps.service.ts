import axios from "axios";
import { IEntity } from "../models/entity.model";

const BUBBLEMAPS_HOST =
  "https://europe-west1-cryptos-tools.cloudfunctions.net/get-bubble-graph-data";
// + ?token=0x603c7f932ed1fc6575303d8fb018fdcbb0f39a95&chain=bsc
export async function getBubblemapsScrapedDataRequest(entity: IEntity) {
  try {
    const { value: token, subSetType: chain  } = entity;

    const response = await axios.request({
      method: "GET",
      url: BUBBLEMAPS_HOST,
      headers: {
        "Content-Type": "application/json",
      },
      params: {
        token,
        chain,
      },
    });

    if(response.status === 401) {
      console.error("Could not retrieve information for the bubblemaps", token)
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}
