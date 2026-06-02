import Product from "../src/models/Product.js";

describe("상품 생성 테스트", () => {
  it("상품을 생성할 수 있다", () => {
    const item = {
      name: "상품이름A",
      imgUrl: "https://example.com/image.jpg",
      price: 35000,
    };

    const product = new Product(item);
    expect(product).toBeInstanceOf(Product);
    expect(product.getProduct()).toEqual(item);
  });

  it("네임 필드 비었을 때 생성 실패", () => {
    const item = {
      name: "",
      imgUrl: "https://example.com/image.jpg",
      price: 35000,
    };

    expect(() => new Product(item)).toThrow();
  });

  it("이미지 확장자로 끝나지 않을 때", () => {
    const item = {
      name: "테스트2",
      imgUrl: "https://example.com/image.jpg",
      price: -3000,
    };

    expect(() => new Product(item)).toThrow();
  });

  it("price 값이 음수일 때 생성 실패", () => {
    const item = {
      name: "테스트2",
      imgUrl: "https://example.com/image.jpg",
      price: -3000,
    };

    expect(() => new Product(item)).toThrow();
  });
});
