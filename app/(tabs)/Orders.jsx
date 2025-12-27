import React from 'react'
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import { gql, useQuery, useMutation } from '@apollo/client'

// 🔹 Query: Get orders (with status)
const GET_RESTAURANT_ORDERS = gql`
  query GetRestaurantOrders($restaurantId: String!) {
    getCachedRestaurantOrders(restaurantId: $restaurantId) {
      orders {
        userId
        orderId
        internalOrderId
        userName
        status   # 🔹 order status
        items {
          dishId
          dishName
          price
          quantity
          imageUrl
        }
        total
        createdAt
      }
      restaurantId
    }
  }
`

// 🔹 Query: Current user
const ME = gql`
  query {
    me {
      id
      email
      name
    }
  }
`

// 🔹 Mutation: Update order status (enum)
const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(
    $restaurantId: String!
    $orderId: String!
    $status: String!
  ) {
    updateOrderStatus(
      restaurantId: $restaurantId
      orderId: $orderId
      status: $status
    )
  }
`

const Orders = () => {
  const { data: meData, loading: meLoading } = useQuery(ME)
  const restaurantId = meData?.me?.name || null

  const { data, loading, error } = useQuery(GET_RESTAURANT_ORDERS, {
    variables: { restaurantId },
    fetchPolicy: 'network-only',
    pollInterval: 5000,
    skip: !restaurantId,
  })

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    refetchQueries: [
      { query: GET_RESTAURANT_ORDERS, variables: { restaurantId } },
    ],
  })

  // 🔹 Status update handler
  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = null
    console.log(orderId, currentStatus);

    if (currentStatus === "paid") nextStatus = "done"
    else if (currentStatus === "done") nextStatus = "delivered"

    if (!nextStatus) return // delivered → no further action

    try {
      await updateOrderStatus({
        variables: { restaurantId, orderId, status: nextStatus },
      })
      console.log(`✅ Order ${orderId} updated to ${nextStatus}`)
    } catch (err) {
      console.error("❌ FULL ERROR OBJECT:", err);
      console.error("❌ GraphQL Errors:", err.graphQLErrors);
      console.error("❌ Network Error:", err.networkError);
    }
  }

  if (loading || meLoading) {
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
        keyExtractor={(item) => item.orderId.toString()}
        renderItem={({ item }) => (
          <View className="mb-6 p-4 rounded-2xl bg-gray-100 shadow">
            {/* 🔹 Order Info */}
            <Text className="text-base font-semibold mb-1">
              Order by: {item.userName} ({item.userId})
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              Created at: {item.createdAt}
            </Text>

            {/* 🔹 Order Items */}
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
                    {dish.dishName}
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

            {/* 🔹 Total */}
            <Text className="mt-2 text-lg font-bold text-right">
              Total: ₹{item.total}
            </Text>

            {/* 🔹 Status Badge */}
            <Text
              className={`mt-2 text-sm font-semibold text-center ${item.status === "pending"
                  ? "text-blue-500"
                  : item.status === "done"
                    ? "text-green-500"
                    : "text-gray-500"
                }`}
            >
              Status: {item.status}
            </Text>

            {/* 🔹 Status Button (driven by query status) */}
            <View className="flex-row mt-3">
              {item.status === "paid" && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item.internalOrderId, item.status)}
                  className="flex-1 p-3 rounded-xl bg-blue-500"
                >
                  <Text className="text-white text-center font-semibold">
                    Mark as Done
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === "done" && (
                <TouchableOpacity
                  onPress={() => handleUpdateStatus(item.internalOrderId, item.status)}
                  className="flex-1 p-3 rounded-xl bg-green-500"
                >
                  <Text className="text-white text-center font-semibold">
                    Mark as Delivered
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  )
}

export default Orders
