import React, { useState, useMemo } from 'react'
import { View, Text, FlatList, Image, TouchableOpacity } from 'react-native'
import { gql, useQuery, useMutation, useSubscription } from '@apollo/client'

/* ------------------ GRAPHQL ------------------ */

const GET_RESTAURANT_ORDERS = gql`
  query GetRestaurantOrders($restaurantId: String!) {
    getCachedRestaurantOrders(restaurantId: $restaurantId) {
      orders {
        userId
        orderId
        internalOrderId
        userName
        status
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

const ME = gql`
  query {
    me {
      id
      email
      name
    }
  }
`

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

const RESTAURANT_SUBSCRIPTION = gql`
  subscription OnRestaurantOrdersUpdated($restaurantId: String!) {
    restaurantOrdersUpdated(restaurantId: $restaurantId) {
      restaurantId
    }
  }
`

/* ------------------ COMPONENT ------------------ */

const Orders = () => {
  const [view, setView] = useState('orders')

  const { data: meData, loading: meLoading } = useQuery(ME)
  const restaurantId = meData?.me?.name || null

  const { data, loading, error, refetch } = useQuery(GET_RESTAURANT_ORDERS, {
    variables: { restaurantId },
    fetchPolicy: 'network-only',
    skip: !restaurantId,
  })

  useSubscription(RESTAURANT_SUBSCRIPTION, {
    variables: { restaurantId },
    skip: !restaurantId,
    onData: () => refetch(),
  })

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS, {
    refetchQueries: [
      { query: GET_RESTAURANT_ORDERS, variables: { restaurantId } },
    ],
  })

  const orders = (data?.getCachedRestaurantOrders?.orders || []).filter(
    order => order.status !== 'pending'
  )

  /* ------------------ DISH AGGREGATION ------------------ */

  const dishStats = useMemo(() => {
    const map: any = {}

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!map[item.dishId]) {
          map[item.dishId] = {
            dishId: item.dishId,
            dishName: item.dishName,
            imageUrl: item.imageUrl,
            totalQuantity: 0,
            orderCount: 0,
          }
        }

        map[item.dishId].totalQuantity += item.quantity
        map[item.dishId].orderCount += 1
      })
    })

    return Object.values(map)
  }, [orders])

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = null
    if (currentStatus === 'paid') nextStatus = 'done'
    else if (currentStatus === 'done') nextStatus = 'delivered'
    if (!nextStatus) return

    await updateOrderStatus({
      variables: { restaurantId, orderId, status: nextStatus },
    })
  }

  if (loading || meLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Loading orders...</Text>
      </View>
    )
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="text-red-500">{error.message}</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      
      {/* 🔥 HEADER */}
      <View className="bg-orange-500 px-6 pt-14 pb-8 rounded-b-[32px]">
        <Text className="text-orange-100 text-xs font-bold tracking-widest uppercase">
          Restaurant Dashboard
        </Text>
        <Text className="text-white text-3xl font-extrabold mt-1">
          Orders Overview
        </Text>
      </View>

      {/* 🔘 TOGGLE */}
      <View className="mx-5 mt-6 bg-orange-50 rounded-full p-1 flex-row">
        <TouchableOpacity
          onPress={() => setView('orders')}
          className={`flex-1 py-3 rounded-full ${
            view === 'orders' ? 'bg-orange-500' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              view === 'orders' ? 'text-white' : 'text-orange-600'
            }`}
          >
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setView('dishes')}
          className={`flex-1 py-3 rounded-full ${
            view === 'dishes' ? 'bg-orange-500' : ''
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              view === 'dishes' ? 'text-white' : 'text-orange-600'
            }`}
          >
            Dish Summary
          </Text>
        </TouchableOpacity>
      </View>

      {/* 🍽 DISH SUMMARY */}
      {view === 'dishes' && (
        <FlatList
          contentContainerStyle={{ padding: 20 }}
          data={dishStats}
          keyExtractor={item => item.dishId}
          renderItem={({ item }) => (
            <View className="flex-row bg-white mb-4 p-4 rounded-3xl shadow-sm border border-orange-100">
              <Image
                source={{ uri: item.imageUrl }}
                className="w-16 h-16 rounded-2xl mr-4"
              />

              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  {item.dishName}
                </Text>
                <Text className="text-sm text-gray-500 mt-1">
                  Orders: {item.orderCount}
                </Text>
              </View>

              <View className="items-end justify-center">
                <Text className="text-xl font-extrabold text-orange-500">
                  × {item.totalQuantity}
                </Text>
                <Text className="text-xs text-gray-400">
                  Total Qty
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* 📦 ORDERS */}
      {view === 'orders' && (
        <FlatList
          contentContainerStyle={{ padding: 20 }}
          data={orders}
          keyExtractor={item => item.orderId.toString()}
          renderItem={({ item }) => (
            <View className="bg-white rounded-3xl p-5 mb-6 shadow-sm border border-gray-100">
              
              <Text className="font-semibold text-gray-900 mb-3">
                {item.userName}
              </Text>

              {item.items.map((dish, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center mb-3 bg-gray-50 p-3 rounded-2xl"
                >
                  <Image
                    source={{ uri: dish.imageUrl }}
                    className="w-14 h-14 rounded-xl mr-3"
                  />
                  <View className="flex-1">
                    <Text className="font-medium">
                      {dish.dishName}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      ₹{dish.price} × {dish.quantity}
                    </Text>
                  </View>
                </View>
              ))}

              <Text className="text-right text-lg font-bold text-gray-900 mt-2">
                ₹{item.total}
              </Text>

              {item.status === 'paid' && (
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatus(item.internalOrderId, item.status)
                  }
                  className="mt-4 bg-orange-500 py-3 rounded-2xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Mark as Done
                  </Text>
                </TouchableOpacity>
              )}

              {item.status === 'done' && (
                <TouchableOpacity
                  onPress={() =>
                    handleUpdateStatus(item.internalOrderId, item.status)
                  }
                  className="mt-4 bg-green-500 py-3 rounded-2xl"
                >
                  <Text className="text-white text-center font-semibold">
                    Mark as Delivered
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  )
}

export default Orders
