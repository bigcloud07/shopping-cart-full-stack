## 상품

### `GET` `/products` - 상품들의 정보를 모두 가져온다.

<details>
<summary>상세 보기</summary>

Success

```js
// Response Status: 200
// 리소스(상품 정보)가 메세지 body에 전달되었기 때문

{
  result: "success",
  data: {
    products: [
      {
        id: 1,
        name: "상품이름A",
        img: "/src.com",
        price: 35000,
      },
      {
        id: 2,
        name: "상품이름B",
        img: "/src.com",
        price: 25000,
      },
    ],
  },
}
```

</details>

### `GET` `/products/:productId` - 특정 상품의 정보를 가져온다.

<details>
<summary>상세 보기</summary>

path params

```js
id: number;
```

Success

```js
// Response Status: 200
// 리소스(상품 정보)가 메세지 body에 전달되었기 때문

{
  result: "success",
  data: {
    id: 1,
    name: "상품이름A",
    img: "/src.com",
    price: 35000,
  },
};
```

400 Error

```js
// Response Status: 400
// 리소스(상품 정보)의 id가 숫자로 변경할 수 없을 때

{
  result: "error",
  message: "해당하는 상품의 id 형식이 유효하지 않습니다.",
};
```

404 Error

```js
// Response Status: 404
// 리소스(상품 정보)의 id가 존재하지 않음

{
  result: "error",
  message: "해당하는 상품이 없습니다.",
};
```

</details>

### `POST` `/products` - 상품 정보를 등록한다.

<details>
<summary>상세 보기</summary>

Success

```js
// Request Body

{
  name: "상품이름A",
  img: "/src.com",
  price: 35000,
}
```

Error

```js
// Response Status: 201
// No Content
```

```js
// Response status 400,
// name 또는 price 필드가 누락된 경우

{
  result: "error",
  message: "형식이 비었습니다",
}
```

```js
// Response status 400,
// 필수 입력 유효성 검증 실패 시, 필드 에러 메세지를 반환한다.

{
  result: "error",
  message: "요청 값이 올바르지 않습니다.",
  errors: [
    {
      field: "name",
      code: "INVALID_PRODUCT_NAME",
      message: "상품 이름이 유효하지 않습니다."
    },
    {
      field: "price",
      code: "INVALID_PRODUCT_PRICE",
      message: "상품 가격이 유효하지 않습니다."
    },
    {
      field: "imageUrl",
      code: "PRODUCT_IMAGE_URL_INVALID",
      message: "유효한 이미지 URL 형식이 아닙니다."
    }
  ]
}
```

</details>

### `DELETE` `/products/:productId` : 특정 상품을 삭제한다.

<details>
<summary>상세 보기</summary>

Success

```js
// Response status 204
// 리소스(상품 정보)의 id가 없어서 메세지 body에 전달되지 않았기 때문

// No Contents
```

해당 상품 id를 찾을 수 없을 때

```js
// Response status 204
// 존재하지 않는 id에도 멱등성을 위해 204를 반환한다.

// No Contents
```

</details>

## 장바구니

### `GET` `/cart` - 장바구니안의 상품 정보들을 모두 가져온다.

<details>
<summary>상세 보기</summary>

장바구니는 단 한명의 유저를 위해서 복수형이 아닌 단수형으로 표현

Success

```js
// Response Status: 200

{
  result: "success",
  data: {
    cartItems: [
      {
        productId: 1,
        productName: "상품이름A",
        productImg: "/src.com",
        productPrice: 35000,
        quantity: 2,
      },
      {
        productId: 2,
        productName: "상품이름B",
        productImg: "/src.com",
        productPrice: 25000,
        quantity: 2,
      },
    ],
  },
}
```

</details>

### `PATCH` `/cart/:productId` - 장바구니에서 해당 상품의 수량을 변경한다.

<details>
<summary>상세 보기</summary>

path params

```js
productId: number;
```

body params

```js
{
  quantity: 3,
}
```

Success

```js
// Response Status: 200

{
  result: "success",
  data: {
    productId: 1,
    quantity: 3,
  },
}
```

400 Error

```js
// Response Status: 400
// quantity가 1 미만이거나 유효하지 않은 값일 때

{
  result: "error",
  message: "수량이 유효하지 않습니다.",
}
```

404 Error

```js
// Response Status: 404
// 해당하는 장바구니 항목이 존재하지 않을 때

{
  result: "error",
  message: "해당하는 장바구니 항목이 없습니다.",
}
```

</details>

### `DELETE` `/cart/:productId` - 장바구니의 특정 상품을 삭제한다.

<details>
<summary>상세 보기</summary>

path params

```js
id: number; // productId
```

Success

```js
// Response Status: 204
// 삭제 성공 또는 존재하지 않는 id — 멱등성을 위해 동일하게 204 반환

// No Contents
```

</details>

## 주문서

### `POST` `/order` - 장바구니 상품들을 주문서에 등록한다.

<details>
<summary>상세 보기</summary>

Request Body

```js
[
  {
    productId: 1,
    productQuantity: 2,
  },
];
```

Success

```js
// Response Status: 201
// 주문서 리소스가 새로 생성되었기 때문

// No Contents
```

500 Error

```js
// Response Status: 500
// DB에 주문서 테이블이 존재하지 않을 때

{
  result: "error",
  message: "주문서 등록에 실패했습니다.",
};
```

</details>

### `GET` `/order` - 주문서 정보를 가져온다.

<details>
<summary>상세 보기</summary>

주문서는 단 한 명의 유저를 위해서 복수형이 아닌 단수형으로 표현

Success

```js
// Response Status: 200
// 리소스(주문서 정보)가 메세지 body에 전달되었기 때문

{
  result: "success",
  data: {
    items: [
      {
        productId: 1,
        productPrice: 35000,
        productQuantity: 2,
      },
      {
        productId: 2,
        productPrice: 25000,
        productQuantity: 1,
      },
    ],
    isRemoteArea: false,
    orderAmount: 70000,
    couponDiscountAmount: 6000,
    shippingFee: 6000,
    totalPaymentAmount: 70000,
  },
};
```

</details>

### `POST` `/order/apply` - 주문서에서 쿠폰이 적용된 결제 금액을 계산한다.

<details>
<summary>상세 보기</summary>

Request Body

```js
{
  couponIds: [1, 4],
}
```

Success

```js
// Response Status: 200
// 주문, 쿠폰 할인, 배송비, 총 결제 금액 계산 결과를 성공적으로 불러왔을 때

{
  result: "success",
  data: {
    totalOrderAmount: 70000,
    couponDiscountAmount: 6000,
    shippingFee: 3000,
    totalPaymentAmount: 67000,
  },
};
```

500 Error

```js
// Response Status: 500
// DB에 해당하는 정보가 존재하지 않을 때

{
  result: "error",
  message: "결제 금액 계산에 실패했습니다.",
};
```

</details>

### `PATCH` `/order` - 제주도 및 도서 산간 지역 체크사항을 업데이트한다.

<details>
<summary>상세 보기</summary>

Request Body

```js
{
  isRemoteArea: true,
}
```

Success

```js
// Response Status: 200
// 도서 산간 지역 상태가 성공적으로 업데이트되었기 때문

{
  result: "success",
  data: {
    isRemoteArea: true,
  },
};
```

400 Error

```js
// Response Status: 400
// isRemoteArea가 boolean이 아니거나 유효하지 않은 값일 때

{
  result: "error",
  message: "요청 값이 올바르지 않습니다.",
};
```

404 Error

```js
// Response Status: 404
// 해당하는 엔드포인트가 존재하지 않을 때

{
  result: "error",
  message: "해당하는 리소스가 없습니다.",
};
```

500 Error

```js
// Response Status: 500
// DB에 해당하는 테이블이 존재하지 않을 때

{
  result: "error",
  message: "요청 처리에 실패했습니다.",
};
```

</details>

## 쿠폰

### `GET` `/coupons` - 쿠폰 목록과 할인 금액 조합을 모두 가져온다.

<details>
<summary>상세 보기</summary>

Success

```js
// Response Status: 200
// 리소스(쿠폰 정보)가 메세지 body에 전달되었기 때문

{
  result: "success",
  data: {
    coupons: [
      {
        id: 1,
        code: "FIXED5000",
        description: "5,000원 할인 쿠폰",
        expirationDate: "2026-11-30",
        discountType: "fixed",
        minimumAmount: 100000,
        discountAmount: 5000,
        applicable: true,
      },
      {
        id: 2,
        code: "BOGO",
        description: "2개 구매시 1개 무료 쿠폰",
        expirationDate: "2026-06-30",
        discountType: "bogo",
        buyQuantity: 2,
        getQuantity: 1,
        applicable: false,
      },
    ],
    primaryPrice: {
      couponIds: [1, 4],
      couponDiscountAmount: 6000,
    },
    secondPrice: [
      { couponIds: [1], couponDiscountAmount: 5000 },
      { couponIds: [2], couponDiscountAmount: 5500 },
      { couponIds: [3, 4], couponDiscountAmount: 6000 },
    ],
  },
};
```

500 Error

```js
// Response Status: 500
// DB에 Coupon 테이블이 존재하지 않을 때

{
  result: "error",
  message: "쿠폰 목록 조회에 실패했습니다.",
};
```

</details>
