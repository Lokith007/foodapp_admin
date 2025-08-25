import React from 'react'
import { View, Text, FlatList, Image } from 'react-native'
import { gql, useQuery } from '@apollo/client'

const GET_RESTAURANT_ORDERS = gql`
  query GetRestaurantOrders($restaurantId: String!) {
    getCachedRestaurantOrders(restaurantId: $restaurantId) {
      orders {
        userId
        orderId
        userName
        items {
          dishId
          dishName
          price
          quantity
          imageUrl
        }
        total
        createdAt
        done
      }
      restaurantId
    }
  }
`

const ME = gql`
  query {
    me {
      id
      email
      name
    }
  }
`;

const Orders = () => {
  const { data: meData, loading: meLoading } = useQuery(ME);
  const userId = meData?.me?.name || null;
  console.log(userId);

  const { data, loading, error } = useQuery(GET_RESTAURANT_ORDERS, {
    variables: { restaurantId: userId },
    fetchPolicy: 'network-only',
    pollInterval: 5000, // 🔁 re-fetch every 5 seconds
    skip: !userId, // ❌ don't run until we have the id
  })


  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg">Loading orders...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-red-500">Error: {error.message}</Text>
      </View>
    )
  }

  const orders = data?.getCachedRestaurantOrders?.orders || []

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold mb-4">Orders</Text>

      <FlatList
        data={orders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className="mb-6 p-4 rounded-2xl bg-gray-100 shadow">
            <Text className="text-base font-semibold mb-1">
              Order by: {item.userId}
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Created at: {item.createdAt}
            </Text>

            {item.items.map((dish, idx) => (
              <View
                key={idx}
                className="flex-row items-center bg-white p-2 rounded-xl mb-2"
              >
                <Image
                  source={{ uri: dish.imageUrl }}
                  className="w-14 h-14 rounded-lg mr-3"
                />
                <View className="flex-1">
                  <Text className="font-medium text-gray-800">
                    {dish.name}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    ₹{dish.price} × {dish.quantity}
                  </Text>
                </View>
                <Text className="font-semibold">
                  ₹{dish.price * dish.quantity}
                </Text>
              </View>
            ))}

            <Text className="mt-2 text-lg font-bold text-right">
              Total: ₹{item.total}
            </Text>
          </View>
        )}
      />
    </View>
  )
}

export default Orders
