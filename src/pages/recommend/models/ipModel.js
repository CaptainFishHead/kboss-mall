import {post} from "@utils/http/index";
import {TEMP_CLOUD} from "@const/index";

export const ipList = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/ip/nl/page`, params)
}

export const ipInfo = (params) => {
  return post(`${TEMP_CLOUD}/cms/app/ip/nl/info`, params)
}