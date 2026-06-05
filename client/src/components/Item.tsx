import type { CartItem } from "../type/type";

interface ItemProps {
  item: CartItem;
  onPlus: (item: Pick<CartItem, "productId" | "quantity">) => Promise<void>;
  onMinus: (item: Pick<CartItem, "productId" | "quantity">) => Promise<void>;
  isSelected: boolean;
  onSelectItem: (productId: Pick<CartItem, "productId">) => void;
  onDelete: (productId: Pick<CartItem, "productId">) => void;
}

export const Item = ({
  item,
  isSelected,
  onPlus,
  onMinus,
  onSelectItem,
  onDelete,
}: ItemProps) => {
  return (
    <div>
      <div>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectItem({ productId: item.productId })}
        ></input>
        <button onClick={() => onDelete({ productId: item.productId })}>
          삭제
        </button>
      </div>
      <div>
        <img src={item.productImg} alt="상품 사진"></img>
        <h1>{item.productName}</h1>
        <p>{item.productPrice}</p>
        <div>
          <button
            onClick={() =>
              onMinus({ productId: item.productId, quantity: item.quantity })
            }
          >
            -
          </button>
          <div>{item.quantity}</div>
          <button
            onClick={() =>
              onPlus({ productId: item.productId, quantity: item.quantity })
            }
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};
