module.exports = {
  // 每行代码的最大字符数，超出后会换行
  printWidth: 100,
  
  // 缩进使用的空格数
  tabWidth: 2,
  
  // 是否使用制表符（tab）进行缩进
  useTabs: false,
  
  // 语句末尾是否加分号
  semi: true,
  
  // 使用单引号而不是双引号
  singleQuote: true,
  
  // 对象属性的引号使用，仅在必要时使用引号
  quoteProps: 'as-needed',
  
  // JSX 中使用单引号而不是双引号
  jsxSingleQuote: true,
  
  // 多行时尽可能打印尾随逗号 all
  "trailingComma": "none",
  // 在对象文字中打印括号之间的空格
  bracketSpacing: true,
  
  // 将多行 JSX 元素的 > 放在最后一行的末尾，而不是单独放在下一行
  // jsxBracketSameLine: false,
  
  // 箭头函数只有一个参数时是否省略圆括号
  arrowParens: 'avoid',
  
  // 格式化文件顶部的 @prettier 或 @format 注释
  requirePragma: false,
  
  // 在文件顶部插入 @prettier 或 @format 注释
  insertPragma: false,
  
  // 使用默认的折行标准
  proseWrap: 'preserve',
  
  // HTML 中空格的敏感度
  htmlWhitespaceSensitivity: 'css',
  
  // 换行符
  endOfLine: 'lf',
  
  // 格式化范围
  rangeStart: 0,
  rangeEnd: Infinity,
  
  // 是否格式化嵌入的代码片段
  embeddedLanguageFormatting: 'auto',
  
  // 是否单独为每个语法选择格式化规则
  overrides: [
    {
      files: '*.wxml',
      options: {
        parser: 'html',
      },
    },
    {
      files: '*.wxss',
      options: {
        parser: 'css',
      },
    },
  ],
};
