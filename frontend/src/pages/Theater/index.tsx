import React from 'react'
import { useGetProductListQuery } from '../../services/product'

type Props = {}

const Theater: React.FC<Props> = () => {

  const { data: products, isLoading } = useGetProductListQuery();

  if (isLoading) return <div>...Loading</div>
  const productList = products?.data.items;

  console.log(productList)

  return (
    <div>
      <ul>
        {productList?.map((item) => {
          return <li key={item?.id}>{item.title}</li>
        })}
      </ul>
    </div>
  )
}

export default Theater