const wenjuanjiexi = {
  "accessToken": "19D41D910E8A27ED2ACCC33257A4A309709E534059BF36E6928FC56C08BB3402726BA5C6222A148217C7C0D890A46F714E19D842AC6C051444E9EED9E9925C3F3EA24EECD037B6E0BFA593FC31588F2E8CAE5F0838BC40F21F41F03B32F470A6C05CE2A3C5F134B91EE8EA3064561C2A9C0581868532A2AB9A982C65E85DDD68E078F9731DE3839862A4A765841C0958",
  "userId": "e1974793cf3a2bd9c870e6c4d17c3fa1",
  "mode": "1",
  "configId": "6694c15ede437c632739a93e",
  "userOptions": [{
    "userOptionValues": ["1994-08-19"],
    "questionCode": "BIRTHDAY"
  }, {
    "userOptionValues": ["1"],
    "questionCode": "GENDER"
  }, {
    "userOptionValues": [173, "65.0"],
    "questionCode": "BMI"
  }, {
    "userOptionValues": [0, "0.0"],
    "questionCode": "BMI"
  }, {
    "userOptionValues": ["2"],
    "questionCode": "LABOUR_STRENGH"
  }, {
    "userOptionValues": [["4"]],
    "questionCode": "CHRONIC_DISEASE"
  }, {
    "userOptionValues": [["2"]],
    "questionCode": "SLEEP_PROBLEM"
  }, {
    "userOptionValues": ["1"],
    "questionCode": "ENOUGH_SLEEP_PROBLEM"
  }, {
    "userOptionValues": [["1", "2", "3"]], "questionCode": "DAYTIME_SYMPTOMS"
  }, {
    "userOptionValues": ["1"],
    "questionCode": "DAYTIME_SYMPTOMS_THREE_TIMES"
  }, {"userOptionValues": ["2"], "questionCode": "DAYTIME_SYMPTOMS_THREE_MONTHS"}
  ]
}


export const questionData = {
  "questionnaire": {
    "bizType": "012502",
    "questionCount": 29,
    "questionnaireItems": [
      {
        "questionId": "60bdcdcdafa135391c1d3653",
        "questionCode": "BIRTHDAY",
        "subQuestionCode": null,
        "questionType": "4",
        "question": {
          "questionContent": "你的出生年月日？",
          "preContents": null,
          "postContents": null,
          "required": true,
          "optionBuilder": {"minValue": 18, "maxValue": 100, "defaultValue": 30, "defaultDate": null, "style": null},
          "optionNodes": [
            {
              "startValue": 18,
              "endValue": 19,
              "conditionValue": "[18,19]",
              "postContents": null
            },
            {
              "startValue": 20,
              "endValue": 39,
              "conditionValue": "[20,39]",
              "postContents": null
            },
            {
              "startValue": 18,
              "endValue": 44,
              "conditionValue": "[18,44]",
              "postContents": null
            }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3654",
        "questionCode": "GENDER",
        "subQuestionCode": null,
        "questionType": "3",
        "question": {
          "questionContent": "你的性别？",
          "preContents": null,
          "postContents": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContent": "男",
            "imageUrls": ["https://files.jiankangyouyi.com/gender-male-image-1.png", "https://files.jiankangyouyi.com/gender-male-image-2.png"],
            "postContents": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContent": "女",
            "imageUrls": ["https://files.jiankangyouyi.com/gender-female-image-1.png", "https://files.jiankangyouyi.com/gender-female-image-2.png"],
            "postContents": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": [
          {
            "conditions": [{"questionCode": "GENDER", "conditionValue": "1"}],
            "nextQuestionCode": null,
            "skipQuestionCount": null,
            "skipQuestionCodes": ["GYNAE_DIEASE", "POSTNATAL_ONE_YEAR", "POSTNATAL_TIME", "LACTATION"],
            "skipSubQuestionCodes": ["BMI-2", "WAISTLINE-2", "BFR-2"]
          }, {
            "conditions": [{"questionCode": "GENDER", "conditionValue": "2"}],
            "nextQuestionCode": null,
            "skipQuestionCount": null,
            "skipQuestionCodes": ["CRYPTORRBEA_SYMPTOMS"],
            "skipSubQuestionCodes": ["BMI-1", "WAISTLINE-1", "BFR-1"]
          }]
      }, {
        "questionId": "60bdcdcdafa135391c1d3655",
        "questionCode": "BMI",
        "subQuestionCode": "BMI-1",
        "questionType": "7",
        "question": {
          "questionContent": "计算身体质量指数BMI",
          "preContents": null,
          "postContents": null,
          "supplementContent": "BMI是身体质量指数，简称体质指数，是国际上常用的衡量人体胖瘦程度以及是否健康的一个标准。计算公式为：BMI=体重（Kg）÷身高（m）²。目前我国成人BMI水平，18.5≤BMI＜24为正常范围，BMI＜18.5为消瘦，24≤BMI＜28为超重；BMI≥28为肥胖。",
          "required": true,
          "optionBuilders": [{
            "optionCode": "1",
            "optionContent": "你的身高？",
            "minValue": 100.0,
            "maxValue": 230.0,
            "defaultValue": 170.0,
            "step": 1.0,
            "unit": "cm",
            "unitCn": "厘米"
          }, {
            "optionCode": "2",
            "optionContent": "你的体重？",
            "minValue": 25.0,
            "maxValue": 200.0,
            "defaultValue": 65.0,
            "step": 0.1,
            "unit": "kg",
            "unitCn": "千克"
          }],
          "optionNodes": [{
            "startValue": 0.0,
            "endValue": 18.4,
            "conditionValue": "thin",
            "postContents": null
          }, {
            "startValue": 18.5,
            "endValue": 23.9,
            "conditionValue": "normal",
            "postContents": null
          }, {
            "startValue": 24.0,
            "endValue": 27.9,
            "conditionValue": "overweight",
            "postContents": null
          }, {
            "startValue": 28.0,
            "endValue": 100.0,
            "conditionValue": "obesity",
            "postContents": null
          }, {"startValue": 45.0, "endValue": 100.0, "conditionValue": ">=45", "postContents": null}]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "BMI", "conditionValue": "obesity"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE"],
          "skipSubQuestionCodes": null
        }, {
          "conditions": [{"questionCode": "BMI", "conditionValue": ">=45"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE", "WEAK_REPETITION_TIME", "HEART_DISEASE", "HISTORY_HEART_DISEASE", "MORE_SIX_MONTH_SYMPTOMS"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "60bdcdcdafa135391c1d3656",
        "questionCode": "BMI",
        "subQuestionCode": "BMI-2",
        "questionType": "7",
        "question": {
          "questionContent": "计算身体质量指数BMI",
          "preContents": null,
          "postContents": null,
          "supplementContent": "BMI是身体质量指数，简称体质指数，是国际上常用的衡量人体胖瘦程度以及是否健康的一个标准。计算公式为：BMI=体重（Kg）÷身高（m）²。目前我国成人BMI水平，18.5≤BMI＜24为正常范围，BMI＜18.5为消瘦，24≤BMI＜28为超重；BMI≥28为肥胖。",
          "required": true,
          "optionBuilders": [{
            "optionCode": "1",
            "optionContent": "你的身高？",
            "minValue": 100.0,
            "maxValue": 230.0,
            "defaultValue": 160.0,
            "step": 1.0,
            "unit": "cm",
            "unitCn": "厘米"
          }, {
            "optionCode": "2",
            "optionContent": "你的体重？",
            "minValue": 25.0,
            "maxValue": 200.0,
            "defaultValue": 55.0,
            "step": 0.1,
            "unit": "kg",
            "unitCn": "千克"
          }],
          "optionNodes": [{
            "startValue": 0.0,
            "endValue": 18.4,
            "conditionValue": "thin",
            "postContents": null
          }, {
            "startValue": 18.5,
            "endValue": 23.9,
            "conditionValue": "normal",
            "postContents": null
          }, {
            "startValue": 24.0,
            "endValue": 27.9,
            "conditionValue": "overweight",
            "postContents": null
          }, {
            "startValue": 28.0,
            "endValue": 100.0,
            "conditionValue": "obesity",
            "postContents": null
          }, {"startValue": 45.0, "endValue": 100.0, "conditionValue": ">=45", "postContents": null}]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "BMI", "conditionValue": "obesity"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE"],
          "skipSubQuestionCodes": null
        }, {
          "conditions": [{"questionCode": "BMI", "conditionValue": ">=45"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE", "WEAK_REPETITION_TIME", "HEART_DISEASE", "HISTORY_HEART_DISEASE", "MORE_SIX_MONTH_SYMPTOMS"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "60bdcdcdafa135391c1d3657",
        "questionCode": "WAISTLINE",
        "subQuestionCode": "WAISTLINE-1",
        "questionType": "5",
        "question": {
          "questionContents": ["你的腰围？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": true,
          "optionBuilder": {
            "minValue": 50.0,
            "maxValue": 200.0,
            "defaultValue": 85.0,
            "step": 1.0,
            "unit": "cm",
            "unitCn": "厘米",
            "relatedDiseases": null
          },
          "optionNodes": [{
            "startValue": 50.0,
            "endValue": 84.0,
            "conditionValue": "normal",
            "postContents": null
          }, {
            "startValue": 85.0,
            "endValue": 89.0,
            "conditionValue": "beforeCenterObesity",
            "postContents": null
          }, {"startValue": 90.0, "endValue": 150.0, "conditionValue": "centerObesity", "postContents": null}]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "WAISTLINE", "conditionValue": "centerObesity"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "60bdcdcdafa135391c1d3658",
        "questionCode": "WAISTLINE",
        "subQuestionCode": "WAISTLINE-2",
        "questionType": "5",
        "question": {
          "questionContents": ["你的腰围？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": true,
          "optionBuilder": {
            "minValue": 50.0,
            "maxValue": 200.0,
            "defaultValue": 80.0,
            "step": 1.0,
            "unit": "cm",
            "unitCn": "厘米",
            "relatedDiseases": null
          },
          "optionNodes": [{
            "startValue": 50.0,
            "endValue": 79.0,
            "conditionValue": "normal",
            "postContents": null
          }, {
            "startValue": 80.0,
            "endValue": 84.0,
            "conditionValue": "beforeCenterObesity",
            "postContents": null
          }, {"startValue": 85.0, "endValue": 150.0, "conditionValue": "centerObesity", "postContents": null}]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "WAISTLINE", "conditionValue": "centerObesity"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["RESIDENCE"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "620a02198f00651eb3daebad",
        "questionCode": "LABOUR_STRENGH",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你平时从事体力劳动的强度？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["休息，主要是坐着或躺着"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["坐位工作，几乎无走动，如办公室职员"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["坐位工作，有时需走动或站立，很少有重体力活动，如司机、学生"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["主要是站着或走着工作，如服务员"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "5",
            "optionValue": "5",
            "defaultChecked": null,
            "conditionValue": "5",
            "optionContents": ["重体力职业工作，如建筑工人、农民或运动员"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "6215fe1be0021915eed3b534",
        "questionCode": "METABOLIC_DISEASE",
        "subQuestionCode": null,
        "questionType": "2",
        "userOptionValues": "['3']",
        "question": {
          "questionContents": ["你目前是否患有以下代谢性疾病?"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [
            {
              "optionCode": "1",
              "optionValue": "1",
              "defaultChecked": null,
              "conditionValue": "1",
              "optionContents": ["2型糖尿病"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "excludeOptionValues": null,
              "hideSelectors": null,
              "showSelectors": null
            },
            {
              "optionCode": "2",
              "optionValue": "2",
              "defaultChecked": null,
              "conditionValue": "2",
              "optionContents": ["高血脂"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "excludeOptionValues": null,
              "hideSelectors": null,
              "showSelectors": null
            },
            {
              "optionCode": "3",
              "optionValue": "3",
              "defaultChecked": null,
              "conditionValue": "3",
              "optionContents": ["高尿酸血症"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "excludeOptionValues": null,
              "hideSelectors": null,
              "showSelectors": null
            },
            {
              "optionCode": "5",
              "optionValue": "5",
              "defaultChecked": null,
              "conditionValue": "5",
              "optionContents": ["脂肪肝"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "excludeOptionValues": null,
              "hideSelectors": null,
              "showSelectors": null
            }, {
              "optionCode": "9",
              "optionValue": "9",
              "defaultChecked": null,
              "conditionValue": "9",
              "optionContents": ["无"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "excludeOptionValues": ["1", "2", "3", "4", "5", "6", "7", "8"],
              "hideSelectors": null,
              "showSelectors": null
            }]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "METABOLIC_DISEASE", "conditionValue": "1"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["FBG", "PBG"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "6215fe1be0021915eed3b536",
        "questionCode": "CHRONIC_DISEASE",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你目前是否患有以下慢性疾病?"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["慢性肾脏病3/4期"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "7",
            "optionValue": "7",
            "defaultChecked": null,
            "conditionValue": "7",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": [
          {
            "conditions": [{"questionCode": "CHRONIC_DISEASE", "conditionValue": "3"}],
            "nextQuestionCode": null,
            "skipQuestionCount": null,
            "skipQuestionCodes": ["WEAK_REPETITION_TIME", "HEART_DISEASE", "HISTORY_HEART_DISEASE", "MORE_SIX_MONTH_SYMPTOMS"],
            "skipSubQuestionCodes": null
          }, {
            "conditions": [{"questionCode": "CHRONIC_DISEASE", "conditionValue": "6"}],
            "nextQuestionCode": null,
            "skipQuestionCount": null,
            "skipQuestionCodes": ["WEAK_REPETITION_TIME", "HEART_DISEASE", "HISTORY_HEART_DISEASE", "MORE_SIX_MONTH_SYMPTOMS"],
            "skipSubQuestionCodes": null
          }]
      }, {
        "questionId": "6215fe1be0021915eed3b537",
        "questionCode": "FAMILY_METABOLIS_DISEASE",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你的直系亲属是否存在以下代谢性疾病？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["痛风"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["高血脂"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "6",
            "optionValue": "6",
            "defaultChecked": null,
            "conditionValue": "6",
            "optionContents": ["高尿酸血症"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "7",
            "optionValue": "7",
            "defaultChecked": null,
            "conditionValue": "7",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3", "4", "5", "6"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3668",
        "questionCode": "FAMILY_ANGIOCARPY_DISEASE",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你的直系亲属是否存在以下心脑血管疾病？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["高血压"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["冠心病"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["脑卒中"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3670",
        "questionCode": "BLOOD_PRESSURE",
        "subQuestionCode": null,
        "questionType": "6",
        "question": {
          "questionContents": ["你静息状态下的血压值？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilders": [
            {
              "optionCode": "1",
              "optionContent": "收缩压",
              "supplementContents": null,
              "minValue": 50.0,
              "maxValue": 230.0,
              "defaultValue": 150.0,
              "step": 1.0,
              "unit": "mmHg",
              "unitCn": "毫米汞柱",
              "relatedDiseases": null,
              "required": false
            },
            {
              "optionCode": "2",
              "optionContent": "舒张压",
              "supplementContents": null,
              "minValue": 30.0,
              "maxValue": 150.0,
              "defaultValue": 80.0,
              "step": 1.0,
              "unit": "mmHg",
              "unitCn": "毫米汞柱",
              "relatedDiseases": null,
              "required": false
            }],
          "optionNodes": [{
            "optionCode": "1",
            "optionIndex": 0,
            "startValue": 50.0,
            "endValue": 230.0,
            "conditionValue": "systolicPressure[50.0,230.0]",
            "postContents": null
          }, {
            "optionCode": "2",
            "optionIndex": 1,
            "startValue": 30.0,
            "endValue": 150.0,
            "conditionValue": "diastolicPressure[30.0,150.0]",
            "postContents": null
          }]
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "DRINK", "conditionValue": "systolicPressure[50.0,230.0]"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["WEAK_REPETITION_TIME", "HEART_DISEASE"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "64b8e3fad951080bf5abd37d",
        "questionCode": "UA",
        "subQuestionCode": null,
        "questionType": "5",
        "question": {
          "questionContents": ["你的血尿酸值？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilder": {
            "minValue": 0.0,
            "maxValue": 2000.0,
            "defaultValue": 270.0,
            "step": 1.0,
            "unit": "μmol/L",
            "unitCn": "微摩尔/升",
            "relatedDiseases": null
          },
          "optionNodes": [{
            "startValue": 0.0,
            "endValue": 2000.0,
            "conditionValue": "[0.0-2000.0]",
            "postContents": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3673",
        "questionCode": "TC",
        "subQuestionCode": null,
        "questionType": "5",
        "question": {
          "questionContents": ["你的总胆固醇指标？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilder": {
            "minValue": 0.01,
            "maxValue": 50.0,
            "defaultValue": 8.0,
            "step": 0.01,
            "unit": "mmol/L",
            "unitCn": "毫摩尔/升",
            "relatedDiseases": null
          },
          "optionNodes": [{"startValue": 0.01, "endValue": 50.0, "conditionValue": "[0.01-50.0]", "postContents": null}]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3674",
        "questionCode": "TG",
        "subQuestionCode": null,
        "questionType": "5",
        "question": {
          "questionContents": ["你的甘油三酯指标？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilder": {
            "minValue": 0.01,
            "maxValue": 40.0,
            "defaultValue": 3.0,
            "step": 0.01,
            "unit": "mmol/L",
            "unitCn": "毫摩尔/升",
            "relatedDiseases": null
          },
          "optionNodes": [{"startValue": 0.01, "endValue": 40.0, "conditionValue": "[0.01-40.0]", "postContents": null}]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3675",
        "questionCode": "HDLC",
        "subQuestionCode": null,
        "questionType": "5",
        "question": {
          "questionContents": ["你的高密度脂蛋白胆固醇？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilder": {
            "minValue": 0.01,
            "maxValue": 10.0,
            "defaultValue": 0.5,
            "step": 0.01,
            "unit": "mmol/L",
            "unitCn": "毫摩尔/升",
            "relatedDiseases": null
          },
          "optionNodes": [{"startValue": 0.01, "endValue": 10.0, "conditionValue": "[0.01-10.0]", "postContents": null}]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3676",
        "questionCode": "LDLC",
        "subQuestionCode": null,
        "questionType": "5",
        "question": {
          "questionContents": ["你的低密度脂蛋白胆固醇？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "required": false,
          "optionBuilder": {
            "minValue": 0.01,
            "maxValue": 20.0,
            "defaultValue": 2.0,
            "step": 0.01,
            "unit": "mmol/L",
            "unitCn": "毫摩尔/升",
            "relatedDiseases": null
          },
          "optionNodes": [{"startValue": 0.01, "endValue": 20.0, "conditionValue": "[0.01-20.0]", "postContents": null}]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d368c",
        "questionCode": "DRINK",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你是否饮酒？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["平均每天>1两酒精"],
            "imageUrls": null,
            "supplementContents": ["50g（1两）酒精=1500ml啤酒=500ml葡萄酒=150ml 38度白酒=100ml高度白酒。"],
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["平均每天0.5-1两酒精"],
            "imageUrls": null,
            "supplementContents": ["25g（0.5两）酒精=750ml啤酒=250ml葡萄酒=75ml 38度白酒=50ml高度白酒。"],
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["平均每天<0.5两酒精"],
            "imageUrls": null,
            "supplementContents": ["25g（0.5两）酒精=750ml啤酒=250ml葡萄酒=75ml 38度白酒=50ml高度白酒。"],
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["不喝酒"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "DRINK", "conditionValue": "1"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["WEAK_REPETITION_TIME", "HEART_DISEASE", "HISTORY_HEART_DISEASE", "MORE_SIX_MONTH_SYMPTOMS"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "6215fe1be0021915eed3b53c",
        "questionCode": "HAVE_PROBLEM",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你是否有以下健康问题？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "5",
            "optionValue": "5",
            "defaultChecked": null,
            "conditionValue": "5",
            "optionContents": ["跟腱增厚"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "7",
            "optionValue": "7",
            "defaultChecked": null,
            "conditionValue": "7",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d366b",
        "questionCode": "PHARMACY_THREE_MONTH",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你是否连续服用以下药物超过3个月？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["利尿剂"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "6",
            "optionValue": "6",
            "defaultChecked": null,
            "conditionValue": "6",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3684",
        "questionCode": "FOOD_EXCESS",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你是否有以下食物摄入超量问题？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["喜好咸菜、火腿、各类炒货和腌制品"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["饭菜放酱油、味精较多"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["吃的食物比较咸"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["每周3次以上吃甜品或含糖饮料"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "7",
            "optionValue": "7",
            "defaultChecked": null,
            "conditionValue": "7",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3", "4", "5", "6"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3685",
        "questionCode": "OVEREATING",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你是否有以下饮食习惯？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["常吃内脏（平均每月大于2次）"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["每周至少吃一次油炸食品"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["每周至少吃三次海鲜、贝类"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["每周至少喝一次浓的肉汤"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "5",
            "optionValue": "5",
            "defaultChecked": null,
            "conditionValue": "5",
            "optionContents": ["每周至少吃一次烧烤"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "6",
            "optionValue": "6",
            "defaultChecked": null,
            "conditionValue": "6",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3", "4", "5"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3686",
        "questionCode": "FOOD_INSUFFICIENT",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你是否有以下食物摄入不足问题？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["蔬菜摄入少，平均每日低于300g"],
            "imageUrls": null,
            "supplementContents": ["300g混合蔬菜约相当于11cm口径的碗1.5碗的量。"],
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["水果摄入少，平均每日低于200g"],
            "imageUrls": null,
            "supplementContents": ["200g水果约相当于1个中等苹果的量。"],
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["平均每周吃粗粮少于3次"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "6",
            "optionValue": "6",
            "defaultChecked": null,
            "conditionValue": "6",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3", "4", "5"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d3689",
        "questionCode": "EXERCISE_STATE",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["过去半年中每周的运动情况是？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": ["单日累计运动30分钟以上记为当日有运动"],
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["除了工作/家务之外几乎不动"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["每周运动1-2天"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["每周运动3-4天"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["每周运动5天以上"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d368b",
        "questionCode": "SIT_TIME",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你近期平均每天静坐时长？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["小于3小时"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["3-8个小时"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["至少8小时"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "60bdcdcdafa135391c1d368d",
        "questionCode": "WATER_INTAKE",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你每天的饮水量？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["少于1000ml"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["1000-1500ml"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["1500-1700ml"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["1700-2000ml"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "5",
            "optionValue": "5",
            "defaultChecked": null,
            "conditionValue": "5",
            "optionContents": ["2000ml以上"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": null
      }, {
        "questionId": "63e4aaa7c075d9678c1ac87d",
        "questionCode": "SMOKE",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你的吸烟情况？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [
            {
              "optionCode": "1",
              "optionValue": "1",
              "defaultChecked": null,
              "conditionValue": "1",
              "optionContents": ["每天<=10支"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [
                {
                  "conditions": [
                    {"questionCode": "SMOKING", "conditionValue": "2"},
                    {"questionCode": "SMOKING-1", "conditionValue": "3"},
                  ]
                },
                {
                  "conditions": [
                    {"questionCode": "SMOKING-2", "conditionValue": "4"},
                  ]
                }
              ],
              "showSelectors": null
            },
            {
              "optionCode": "2",
              "optionValue": "2",
              "defaultChecked": null,
              "conditionValue": "2",
              "optionContents": ["每天11-20支"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "2"}]}],
              "showSelectors": null
            }, {
              "optionCode": "3",
              "optionValue": "3",
              "defaultChecked": null,
              "conditionValue": "3",
              "optionContents": ["每天21~30支"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "2"}]}],
              "showSelectors": null
            }, {
              "optionCode": "4",
              "optionValue": "4",
              "defaultChecked": null,
              "conditionValue": "4",
              "optionContents": ["不抽烟但会接触二手烟，接触史＜20年"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "1"}]}],
              "showSelectors": null
            }, {
              "optionCode": "5",
              "optionValue": "5",
              "defaultChecked": null,
              "conditionValue": "5",
              "optionContents": ["不抽烟但会接触二手烟，接触史≥20年"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "1"}]}],
              "showSelectors": null
            }, {
              "optionCode": "6",
              "optionValue": "6",
              "defaultChecked": null,
              "conditionValue": "6",
              "optionContents": ["每天>30支"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "2"}]}],
              "showSelectors": null
            }, {
              "optionCode": "7",
              "optionValue": "7",
              "defaultChecked": null,
              "conditionValue": "7",
              "optionContents": ["戒烟＜5年"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": null,
              "showSelectors": null
            }, {
              "optionCode": "8",
              "optionValue": "8",
              "defaultChecked": null,
              "conditionValue": "8",
              "optionContents": ["5年＜戒烟＜15年"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": null,
              "showSelectors": null
            }, {
              "optionCode": "9",
              "optionValue": "9",
              "defaultChecked": null,
              "conditionValue": "9",
              "optionContents": ["戒烟≥15年"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": null,
              "showSelectors": null
            }, {
              "optionCode": "10",
              "optionValue": "10",
              "defaultChecked": null,
              "conditionValue": "10",
              "optionContents": ["现在和曾经均不抽烟也不接触二手烟"],
              "imageUrls": null,
              "supplementContents": null,
              "postContents": null,
              "hideSelectors": [{"conditions": [{"questionCode": "SMOKING", "conditionValue": "1"}]}],
              "showSelectors": null
            }],
          "defaultOptionCode": null
        },
        "nextSelectors": [{
          "conditions": [
            {"questionCode": "SMOKE", "conditionValue": "10"},
            {"questionCode": "SMOKE1", "conditionValue": "170"}
          ],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["YEAR_SMOKING_LEAST_THIRTY_PACKS"],
          "skipSubQuestionCodes": null
        }]
      }, {
        "questionId": "60bdcdcdafa135391c1d3694",
        "questionCode": "MENTAL_STATE",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["你是否经常存在以下精神状态？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["心理压力大紧张"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["焦虑、担忧"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["愤怒"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["恐慌"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "6",
            "optionValue": "6",
            "defaultChecked": null,
            "conditionValue": "6",
            "optionContents": ["无"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3", "4", "5"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      }, {
        "questionId": "63e4aaa7c075d9678c1ac87f",
        "questionCode": "JOB_EXPOSE_HISTORY_LEAST_ONE_YEAR",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
          "questionContents": ["你是否有相关职业暴露史（石棉、氡、铍、铬、镉、镍、硅、煤烟和煤烟尘）至少1年？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["是"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["否"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "hideSelectors": null,
            "showSelectors": null
          }],
          "defaultOptionCode": null
        },
        "nextSelectors": [{
          "conditions": [{"questionCode": "JOB_EXPOSE_HISTORY_LEAST_ONE_YEAR", "conditionValue": "1"}],
          "nextQuestionCode": null,
          "skipQuestionCount": null,
          "skipQuestionCodes": ["LIVE_ENVIRONMENTAL"],
          "skipSubQuestionCodes": null
        }]
      },
      {
        "questionId": "60bdcdcdafa135391c1d3695",
        "questionCode": "LIVE_ENVIRONMENTAL",
        "subQuestionCode": null,
        "questionType": "2",
        "question": {
          "questionContents": ["您是否长期居住或工作在以下环境？"],
          "preContents": null,
          "postContents": null,
          "supplementContents": null,
          "imageUrls": null,
          "required": true,
          "options": [{
            "optionCode": "1",
            "optionValue": "1",
            "defaultChecked": null,
            "conditionValue": "1",
            "optionContents": ["接触粉尘、有毒有害化学气体、重金属颗粒等"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "2",
            "optionValue": "2",
            "defaultChecked": null,
            "conditionValue": "2",
            "optionContents": ["目前使用煤炉或柴草烹饪或取暖"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "3",
            "optionValue": "3",
            "defaultChecked": null,
            "conditionValue": "3",
            "optionContents": ["空气污染严重地区"],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": null,
            "hideSelectors": null,
            "showSelectors": null
          }, {
            "optionCode": "4",
            "optionValue": "4",
            "defaultChecked": null,
            "conditionValue": "4",
            "optionContents": ["无 "],
            "imageUrls": null,
            "supplementContents": null,
            "postContents": null,
            "excludeOptionValues": ["1", "2", "3"],
            "hideSelectors": null,
            "showSelectors": null
          }]
        },
        "nextSelectors": null
      },
      {
        "questionId": "6193446aad7a4432b50bab94",
        "questionType": "8",
        "questionCode": "POSTNATAL_TIME",
        "question": {
          "optionNodes": [
            {
              "endValue": 0,
              "startValue": null,
              "conditionValue": "[-365,0]",
              "postContents": null
            }
          ],
          "questionContent": "你的分娩日期是？",
          "preContents": null,
          "required": true,
          "optionBuilder": {
            "maxValue": 0,
            "defaultValue": 0,
            "style": "yyyy-MM-dd",
            "minValue": null
          },
          "postContents": null
        },
        "nextSelectors": null,
        "subQuestionCode": null
      },
    ]
  }
}