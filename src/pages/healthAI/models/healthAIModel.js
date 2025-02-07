import {post} from "@utils/http/index";
import {HEALTH_AI, JKYY_3_API, JKYY_4_API, JKYY_BIZ_TYPE} from "@const/index";

export const jkyy_channel = '1'//生成报告渠道 1:测评问卷参数生成，2：未测评，对接方参数生成
/**
* TYPE_2_DIABETES ：2型糖尿病
HYPERTENSION ：高血压
HPYPERLIPIDEMIA ：高血脂
HYPERURICEMIA ：高尿酸血症
*
STROKE：脑卒中
CVD：心血管疾病（冠心病）
INSOMNIA_CHRONIC_SYNDROME：慢性失眠症
*
*业务类型	业务类型名称	对应 configId
012502	四高	668641272637b72a4bd9a15a
012502	脑卒中	6694c14619b09f0ecd0de12f
012502	慢性失眠证	6694c15ede437c632739a93e
012502	冠心病	6694c13719b09f0ecd0de121
* */

/**
 * health-AI 接口文档：
 * https://healthai.jiankangyouyi.com/views/doc_detail.html?path=2947*/
/**
 * 获取健康友谊- health-AI token
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getJkyjToken = params => {
  return post(`/innersupport/app/jkyj/token/get`, params);
};


/**
 * 获取健康评估中心权限列表
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getHealthAIAssessment = params => {
  return post(`${HEALTH_AI}/data-center/v1/api/auth/health-assessment?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_4_API})
}

/**
 * 获取测评问卷权限
 * @param userId String 接入方的用户ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getHealthAIPermission = params => {
  return post(`${HEALTH_AI}/assessment/v5/api/permission?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 获取测评问卷接口
 * @param accessToken String 测评访问权限token
 * @param userId String 接入方的用户ID
 * @param mode String 问卷模型 1:精简，2：精准 注：随访中心紧支持 精准 模型
 * @param healthProblems List<Object> 健康问题配置
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getHealthAIQuestionnaire = params => {
  return post(`${HEALTH_AI}/assessment/v4/api/health-center/questionnaire/customized?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 解析测评问卷
 * @param accessToken String  测评访问权限token
 * @param userId String 接入方的用户ID
 * @param userOptions List<Object> 选择结果
 * @returns {Promise<AxiosResponse<*>>}
 */
export const healthAIQuestionsAnalysis = params => {
  return post(`${HEALTH_AI}/assessment/v7/api/questionnaire/analysis?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 生成测评报告
 * @param accessToken String  测评访问权限token
 * @param userId String 接入方的用户ID
 * @param mode String 问卷模型 1:精简，2：精准
 * @param channel String 生成报告渠道 1:测评问卷参数生成，2：未测评，对接发方参数生成
 * @param assessmentParams Object 不同的业务类型，使用的测评参数数据结构不一样
 * @param healthProblems List<Object> 健康问题配置
 * @returns {Promise<AxiosResponse<*>>}
 */
export const generateHealthAIReport = params => {
  return post(`${HEALTH_AI}/assessment/v6/api/report-create/customized?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 获取测评报告
 * @param userId String 接入方的用户ID
 * @param reportId Object 报告ID，您需要先调用生成测评报告接口以获取报告ID（reportId）
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getHealthAIReport = params => {
  return post(`${HEALTH_AI}/assessment/v6/api/report/customized?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 获取最后一次测评报告
 * @param userId String 接入方的用户ID
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getLastHealthAIReport = params => {
  return post(`${HEALTH_AI}/assessment/v6/api/report/last?bizType=${JKYY_BIZ_TYPE}`, params, {baseURL: JKYY_3_API})
}

/**
 * 接口文档：https://dev-steamengine-api.kang-boss.com/doc.html#/steamengine-member/FE-%E7%94%A8%E6%88%B7%E6%B5%8B%E8%AF%84%E8%AE%B0%E5%BD%95/saveJkpRecordUsingPOST
 * HealthAI-测评-问卷-上报
 * @param data 上报数据 true object
 * @param detectCode 测评code true object
 * @param detectModelType 测评模型类型 false string
 * @param detectTitle 测评的标题 false string
 * @param itemId 测评条目记录id false string
 * @returns {Promise<AxiosResponse<*>>}
 */
export const questionnaireSave = params => {
  return post(`/member/app/detect/jkyj/questionnaire/save`, params)
}

/**
 *
 * HealthAI-测评-报告-上报
 * @param data 上报数据 true object
 * @param detectCode 测评code true object
 * @param detectModelType 测评模型类型 false string
 * @param detectTitle 测评的标题 false string
 * @param itemId 测评条目记录id false string
 * @returns {Promise<AxiosResponse<*>>}
 */
export const reportSave = params => {
  return post(`/member/app/detect/jkyj/report/save`, params)
}

/**
 *
 * HealthAI-测评-列表
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getReportList = params => {
  return post(`/member/app/evaluationLib/list`, params)
}


/**
 *
 * HealthAI-测评-列表-历史记录
 * @param
 * @returns {Promise<AxiosResponse<*>>}
 */
export const getReporthistoryList = params => {
  return post(`/member/app/evaluationLib/historyList`, params)
}
