import axios from 'axios'
import React, { useEffect } from 'react'
import { serverUrl } from '../App'
import { useDispatch, useSelector } from 'react-redux'
import {  setCurrentAddress, setCurrentCity, setCurrentState, setUserData } from '../redux/userSlice'
import { setAddress, setLocation } from '../redux/mapSlice'

function useUpdateLocation() {
    const dispatch=useDispatch()
    const {userData}=useSelector(state=>state.user)

    useEffect(()=>{
      if (!userData) return;

const updateLocation=async (lat,lon) => {
    try {
        const geoResult=await axios.get(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`)
        const {city,principalSubdivision:state,localityInfo:{administrative}} = geoResult.data
        const address = `${geoResult.data.locality}, ${city}, ${state}`
        dispatch(setCurrentCity(city))
        dispatch(setCurrentState(state))
        dispatch(setCurrentAddress(address))
        dispatch(setLocation({lat,lon}))
        dispatch(setAddress(address))
        const result=await axios.post(`${serverUrl}/api/user/update-location`,{lat,lon},{withCredentials:true})
        console.log(result.data)
    } catch (error) {
        console.log('Location update error:', error)
    }
}

if (navigator.geolocation) {
    navigator.geolocation.watchPosition((pos)=>{
        updateLocation(pos.coords.latitude,pos.coords.longitude)
    }, (error) => {
        console.log('Geolocation error:', error)
    })
} else {
    console.log('Geolocation not supported')
}
    },[userData])
}

export default useUpdateLocation
