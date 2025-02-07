# 选择规格弹窗
***

```javascript
/**
 * @param product : object : 商品信息 
 * @param productNum : string : 已选的商品规格id 
 * @event changenum 数量变化事件回调
 * @returns {Promise<AxiosResponse<any>>}
 */
<goods-count product="{{product}}" productNum="{{productNum}}" bind:changenum="changeNum">
  ...
</goods-count>
```