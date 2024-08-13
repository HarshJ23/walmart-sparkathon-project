import React from 'react'
import { Shirt } from 'lucide-react';
import { CookingPot } from 'lucide-react';
import { Paintbrush } from 'lucide-react';
import { Heater } from 'lucide-react';



export default function HomeStarter() {
  return (
    <div className='min-h-screen flex flex-col items-center'>
      <p className='font-extrabold italic text-5xl hover:cursor-pointer drop-shadow-xl text-primary'><span className='text-yellow-400'>Mr.</span>Sam</p>
      <p className='mt-2'>Intelligent shopping assistant for Walmart.com</p>

      <div className='flex flex-row gap-6 mt-10'>
        <div className='border-[1.2px] border-gray-300 h-28 w-36 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-gray-100 transition-colors p-4 flex items-center justify-center'>
        <Shirt size={15} color='#3e9392'/>
          <span className='text-sm font-medium text-center text-gray-600'>Want to buy Men's t-shirt.</span>
        </div>
        <div className='border-[1.2px] border-gray-300 h-28 w-36 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-gray-100 transition-colors p-4 flex items-center justify-center'>
        <Heater size={15} color='#9333ea'/>
          <span className='text-sm font-medium text-center text-gray-600'>Find best deals on ovens.</span>
        </div>
        <div className='border-[1.2px] border-gray-300 h-28 w-36 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-gray-100 transition-colors p-4 flex items-center justify-center'>
        <CookingPot size={15} color='#f97316'/>
          <span className='text-sm font-medium text-center text-gray-600'>Buy ingredients for pancakes.</span>
        </div>
        <div className='border-[1.2px] border-gray-300 h-28 w-36 flex-col gap-3 rounded-xl shadow-sm hover:cursor-pointer hover:bg-gray-100 transition-colors p-4 flex items-center justify-center'>
        <Paintbrush size={15} color='#facc15'/>
        <span className='text-sm font-medium text-center text-gray-600'>Suggest items for home decor.</span>
        </div>
      </div>
    </div>
  )
}