import React from 'react'
import { Text } from 'react-native'
import { AsyncStorage } from 'react-native'
import {getInitailData, MOBI_FLASHCARDS_STORAGE_KEY, MOBI_FLASHCARDS_NOTIFY_KEY } from './api'
import * as Permissions from 'expo-permissions'
import { Notifications } from 'expo'

export const getDecks = async () => {
    try{
        const values = await AsyncStorage.getItem(MOBI_FLASHCARDS_STORAGE_KEY)
        if (values) {
            return JSON.parse(values)
        }
        else {
            await AsyncStorage.setItem(
                MOBI_FLASHCARDS_STORAGE_KEY,
                JSON.stringify(getInitailData())
            )
            return getInitailData()
        }
    } catch(e){
        console.log("Problem getting data: ", e)
    }
}

export const saveDeck = async (title) => {
    try{
        const values = await AsyncStorage.mergeItem(MOBI_FLASHCARDS_STORAGE_KEY, 
            JSON.stringify({
            [title]: {
                title,
                questions: []
            }
        }))
    
        return values
    } catch(e){
        console.log("Error saving deck: ", e)
    }
}

export const saveCard = async (key, values) => {
    try{
        return await AsyncStorage.getItem(MOBI_FLASHCARDS_STORAGE_KEY)
            .then(results => JSON.parse(results))
            .then( results => {
                results[key].questions.push(values)
                AsyncStorage.setItem(MOBI_FLASHCARDS_STORAGE_KEY, JSON.stringify(results))
                return results
            })

    }catch(e){
        console.log("Error saving card: ", e)
    }
}
/*
* Card Length
*/

export const getCardLength = (questions) => {
    if(questions.length === 0){
        return <Text>No card added</Text>
    }else if (questions.length === 1){
        return <Text>Total 1 Card</Text>
    }else{
        return <Text>Total {questions.length} Cards</Text>
    }
}


/*
* Local Notification
*/

export function clearLocalNotification(){
    return AsyncStorage.removeItem(MOBI_FLASHCARDS_NOTIFY_KEY)
        .then(Notifications.cancelAllScheduledNotificationsAsync)
}

function createNotification(){
    return{
        title: "Participate one card today",
        body: "Don't forget to participate a card",
        ios:{
            sound: true
        },
        android:{
            sound: true,
            priority: 'high',
            sticky: false,
            vibrate: false
        }
    }
}

export function setLocalNotification(){
    AsyncStorage.setItem(MOBI_FLASHCARDS_NOTIFY_KEY)
        .then(JSON.parse)
        .then((data) => {
            if(!data){
                Permissions.askAsync(Permissions.NOTIFICATIONS)
                    .then(({ status }) => {
                        if(status === 'granted'){
                            Notifications.cancelAllScheduledNotificationsAsync()

                            let tomorrow = new Date()
                            tomorrow.setDate(tomorrow.getDate + 1)
                            tomorrow.setHours(20)
                            tomorrow.setMinutes(0)

                            Notifications.scheduleLocalNotificationAsync(
                                createNotification(),
                                {
                                time: tomorrow,
                                repeat: 'day'
                                }
                            )

                            AsyncStorage.setItem(MOBI_FLASHCARDS_NOTIFY_KEY, JSON.stringify(true))
                        }
                    })
            }
        })
}