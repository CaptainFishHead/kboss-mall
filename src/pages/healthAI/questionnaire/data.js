export default {
    "code": 200,
    "msg": "success",
    "data": [{
        "questionId": "63e4aaa7c075d9678c1ac87c",
        "questionCode": "SMOKING",
        "subQuestionCode": null,
        "questionType": "1",
        "question": {
            "questionContents": [
                "你目前是否吸烟？"
            ],
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
                    "optionContents": [
                        "吸烟"
                    ],
                    "imageUrls": null,
                    "supplementContents": null,
                    "postContents": null,
                    "hideSelectors": null,
                    "showSelectors": null
                },
                {
                    "optionCode": "2",
                    "optionValue": "2",
                    "defaultChecked": null,
                    "conditionValue": "2",
                    "optionContents": [
                        "不吸烟"
                    ],
                    "imageUrls": null,
                    "supplementContents": null,
                    "postContents": null,
                    "hideSelectors": null,
                    "showSelectors": null
                }
            ],
            "defaultOptionCode": null
        },
        "nextSelectors": null
    },
        {
            "questionId": "63e4aaa7c075d9678c1ac87d",
            "questionCode": "SMOKE",
            "subQuestionCode": null,
            "questionType": "1",
            "question": {
                "questionContents": [
                    "你的吸烟情况？"
                ],
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
                        "optionContents": [
                            "每天<=10支"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "2"
                                    }
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
                        "optionContents": [
                            "每天11-20支"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "2"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    },
                    {
                        "optionCode": "3",
                        "optionValue": "3",
                        "defaultChecked": null,
                        "conditionValue": "3",
                        "optionContents": [
                            "每天21~30支"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "2"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    },
                    {
                        "optionCode": "4",
                        "optionValue": "4",
                        "defaultChecked": null,
                        "conditionValue": "4",
                        "optionContents": [
                            "不抽烟但会接触二手烟，接触史＜20年"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "1"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    },
                    {
                        "optionCode": "5",
                        "optionValue": "5",
                        "defaultChecked": null,
                        "conditionValue": "5",
                        "optionContents": [
                            "不抽烟但会接触二手烟，接触史≥20年"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "1"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    },
                    {
                        "optionCode": "6",
                        "optionValue": "6",
                        "defaultChecked": null,
                        "conditionValue": "6",
                        "optionContents": [
                            "每天>30支"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "2"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    },
                    {
                        "optionCode": "7",
                        "optionValue": "7",
                        "defaultChecked": null,
                        "conditionValue": "7",
                        "optionContents": [
                            "戒烟＜5年"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": null,
                        "showSelectors": null
                    },
                    {
                        "optionCode": "8",
                        "optionValue": "8",
                        "defaultChecked": null,
                        "conditionValue": "8",
                        "optionContents": [
                            "5年＜戒烟＜15年"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": null,
                        "showSelectors": null
                    },
                    {
                        "optionCode": "9",
                        "optionValue": "9",
                        "defaultChecked": null,
                        "conditionValue": "9",
                        "optionContents": [
                            "戒烟≥15年"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": null,
                        "showSelectors": null
                    },
                    {
                        "optionCode": "10",
                        "optionValue": "10",
                        "defaultChecked": null,
                        "conditionValue": "10",
                        "optionContents": [
                            "现在和曾经均不抽烟也不接触二手烟"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": [
                            {
                                "conditions": [
                                    {
                                        "questionCode": "SMOKING",
                                        "conditionValue": "1"
                                    }
                                ]
                            }
                        ],
                        "showSelectors": null
                    }
                ],
                "defaultOptionCode": null
            },
            "nextSelectors": [
                {
                    "conditions": [
                        {
                            "questionCode": "SMOKE",
                            "conditionValue": "10"
                        }
                    ],
                    "nextQuestionCode": null,
                    "skipQuestionCount": null,
                    "skipQuestionCodes": [
                        "YEAR_SMOKING_LEAST_THIRTY_PACKS"
                    ],
                    "skipSubQuestionCodes": null
                }
            ]
        },
        {
            "questionId": "63e4aaa7c075d9678c1ac87e",
            "questionCode": "YEAR_SMOKING_LEAST_THIRTY_PACKS",
            "subQuestionCode": null,
            "questionType": "1",
            "question": {
                "questionContents": [
                    "你现在或曾经的吸烟年包数是否≥30？（年包数=每天吸烟包数*吸烟年数）"
                ],
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
                        "optionContents": [
                            "是"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": null,
                        "showSelectors": null
                    },
                    {
                        "optionCode": "2",
                        "optionValue": "2",
                        "defaultChecked": null,
                        "conditionValue": "2",
                        "optionContents": [
                            "否"
                        ],
                        "imageUrls": null,
                        "supplementContents": null,
                        "postContents": null,
                        "hideSelectors": null,
                        "showSelectors": null
                    }
                ],
                "defaultOptionCode": null
            },
            "nextSelectors": null
        },
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
                "optionBuilder": {
                    "minValue": 18,
                    "maxValue": 100,
                    "defaultValue": 30,
                    "defaultDate": null,
                    "style": null
                },
                "optionNodes": [{
                    "startValue": 18,
                    "endValue": 19,
                    "conditionValue": "[18,19]",
                    "postContents": null
                }, {
                    "startValue": 20,
                    "endValue": 39,
                    "conditionValue": "[20,39]",
                    "postContents": null
                }, {
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
            "nextSelectors": [{
                "conditions": [{
                    "questionCode": "GENDER",
                    "conditionValue": "1"
                }],
                "nextQuestionCode": null,
                "skipQuestionCount": null,
                "skipQuestionCodes": ["GYNAE_DIEASE", "POSTNATAL_ONE_YEAR", "POSTNATAL_TIME", "LACTATION"],
                "skipSubQuestionCodes": ["BMI-2", "WAISTLINE-2", "BFR-2"]
            }, {
                "conditions": [{
                    "questionCode": "GENDER",
                    "conditionValue": "2"
                }],
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
                    "minValue": 100,
                    "maxValue": 230,
                    "defaultValue": 170,
                    "step": 1,
                    "unit": "cm",
                    "unitCn": "厘米"
                }, {
                    "optionCode": "2",
                    "optionContent": "你的体重？",
                    "minValue": 25,
                    "maxValue": 200,
                    "defaultValue": 65,
                    "step": 0.1,
                    "unit": "kg",
                    "unitCn": "千克"
                }],
                "optionNodes": [{
                    "startValue": 0,
                    "endValue": 18.4,
                    "conditionValue": "thin",
                    "postContents": null
                }, {
                    "startValue": 18.5,
                    "endValue": 23.9,
                    "conditionValue": "normal",
                    "postContents": null
                }, {
                    "startValue": 24,
                    "endValue": 27.9,
                    "conditionValue": "overweight",
                    "postContents": null
                }, {
                    "startValue": 28,
                    "endValue": 100,
                    "conditionValue": "obesity",
                    "postContents": null
                }, {
                    "startValue": 45,
                    "endValue": 100,
                    "conditionValue": ">=45",
                    "postContents": null
                }]
            },
            "nextSelectors": [{
                "conditions": [{
                    "questionCode": "BMI",
                    "conditionValue": "obesity"
                }],
                "nextQuestionCode": null,
                "skipQuestionCount": null,
                "skipQuestionCodes": ["RESIDENCE", "WAISTLINE-1"],
                "skipSubQuestionCodes": null
            }, {
                "conditions": [{
                    "questionCode": "BMI",
                    "conditionValue": ">=45"
                }],
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
                    "minValue": 100,
                    "maxValue": 230,
                    "defaultValue": 160,
                    "step": 1,
                    "unit": "cm",
                    "unitCn": "厘米"
                }, {
                    "optionCode": "2",
                    "optionContent": "你的体重？",
                    "minValue": 25,
                    "maxValue": 200,
                    "defaultValue": 55,
                    "step": 0.1,
                    "unit": "kg",
                    "unitCn": "千克"
                }],
                "optionNodes": [{
                    "startValue": 0,
                    "endValue": 18.4,
                    "conditionValue": "thin",
                    "postContents": null
                }, {
                    "startValue": 18.5,
                    "endValue": 23.9,
                    "conditionValue": "normal",
                    "postContents": null
                }, {
                    "startValue": 24,
                    "endValue": 27.9,
                    "conditionValue": "overweight",
                    "postContents": null
                }, {
                    "startValue": 28,
                    "endValue": 100,
                    "conditionValue": "obesity",
                    "postContents": null
                }, {
                    "startValue": 45,
                    "endValue": 100,
                    "conditionValue": ">=45",
                    "postContents": null
                }]
            },
            "nextSelectors": [{
                "conditions": [{
                    "questionCode": "BMI",
                    "conditionValue": "obesity"
                }],
                "nextQuestionCode": null,
                "skipQuestionCount": null,
                "skipQuestionCodes": ["RESIDENCE"],
                "skipSubQuestionCodes": null
            }, {
                "conditions": [{
                    "questionCode": "BMI",
                    "conditionValue": ">=45"
                }],
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
                    "minValue": 50,
                    "maxValue": 200,
                    "defaultValue": 85,
                    "step": 1,
                    "unit": "cm",
                    "unitCn": "厘米",
                    "relatedDiseases": null
                },
                "optionNodes": [{
                    "startValue": 50,
                    "endValue": 84,
                    "conditionValue": "normal",
                    "postContents": null
                }, {
                    "startValue": 85,
                    "endValue": 89,
                    "conditionValue": "beforeCenterObesity",
                    "postContents": null
                }, {
                    "startValue": 90,
                    "endValue": 150,
                    "conditionValue": "centerObesity",
                    "postContents": null
                }]
            },
            "nextSelectors": [{
                "conditions": [{
                    "questionCode": "WAISTLINE",
                    "conditionValue": "centerObesity"
                }],
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
            "nextSelectors": [{
                "conditions": [{
                    "questionCode": "BMI",
                    "conditionValue": "1"
                }],
                "nextQuestionCode": null,
                "skipQuestionCount": null,
                "skipQuestionCodes": ["RESIDENCE"],
                "skipSubQuestionCodes": null
            }]
        }, {
            "questionId": "6215fe1be0021915eed3b534",
            "questionCode": "METABOLIC_DISEASE",
            "subQuestionCode": null,
            "questionType": "2",
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
                    }, {
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
                    }, {
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
                    }, {
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
            //[1,3,4]
            "nextSelectors": [
                {
                    "conditions": [
                        {
                            "questionCode": "METABOLIC_DISEASE",
                            "conditionValue": "1"
                        },
                        {
                            "questionCode": "METABOLIC_DISEASE",
                            "conditionValue": "3"
                        }],
                    "nextQuestionCode": null,
                    "skipQuestionCount": null,
                    "skipQuestionCodes": ["FBG", "PBG"],
                    "skipSubQuestionCodes": null
                },
                {
                    "conditions": [
                        {
                            "questionCode": "METABOLIC_DISEASE",
                            "conditionValue": "2"
                        },
                        {
                            "questionCode": "METABOLIC_DISEASE",
                            "conditionValue": "4"
                        }],
                    "nextQuestionCode": null,
                    "skipQuestionCount": null,
                    "skipQuestionCodes": ["BNM", "HJK"],
                    "skipSubQuestionCodes": null
                }]
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
                    "minValue": 0,
                    "maxValue": 2000,
                    "defaultValue": 270,
                    "step": 1,
                    "unit": "μmol/L",
                    "unitCn": "微摩尔/升",
                    "relatedDiseases": null
                },
                "optionNodes": [{
                    "startValue": 0,
                    "endValue": 2000,
                    "conditionValue": "[0.0-2000.0]",
                    "postContents": null
                }]
            },
            "nextSelectors": null
        }]
}