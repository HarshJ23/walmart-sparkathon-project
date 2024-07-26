'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LuSend } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from '@/components/shared/StarRating';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Loader from '@/components/shared/Loader';

// card component imports
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  image: string;
  link: string;
  price: number;
  title: string;
  rating: string;

}

interface ProductResult {
  product: string;
  results: Product[];
}

interface Message {
  type: 'user' | 'bot';
  text: string;
  results?: ProductResult[];
}

const placeholders = [
  "Ask - Ingredients for Pancakes?",
  "Ask - Recipe and items to cook roasted duck?",
  "Ask - Plan snacks for a football watch party at my house",
  "Ask - Comfortable shorts for football.",
  "Ask - I'm an avid football fan. what type of tv suits best to me?",
  "Ask - Who are the Top 3 best selling artists?",
  "Ask - Which is the most purchased Media Type?"
];


const data = {
  "assistant_response": "I've got some great snack ideas for your football watch party! You can serve Buffalo Chicken Dip for a spicy kick, an assorted chips variety pack for crunchy munching, mini pizzas for a filling option, and a veggie platter with dip to balance it all out. Enjoy the game!",
  "results": [
      {
          "product": "Buffalo Chicken Dip",
          "results": [
              {   "pid" : "0SJLBGR6ZN6S",
                  "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/fef6875f-2779-4566-bc79-d357dc388c82.c42c7f022d41b7f8b7440c5b45782fc2.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Sweet-Baby-Ray-s-Creamy-Buffalo-Dip-Dipping-Sauce-14-fl-oz/45743136",
                  "price": 14.95,
                  "title": "Sweet Baby Ray's Creamy Buffalo Dip Dipping Sauce 14 fl oz"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/7ca59c3b-0d84-4330-b51f-f80b66a9ffc3.3e3863f183d809a4377fee9febd5e353.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Mrs-Taste-Zero-Calories-Buffalo-Wing-Sauce-10-oz/2321756229",
                  "price": 14.99,
                  "title": "Mrs Taste Zero Calories Buffalo Wing Sauce 10 oz"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/6eec6716-ec9f-4ac1-ade9-1b79a9914bc6.ef055d3a0f6c4f7c5a7c8cc33396e14c.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Primal-Kitchen-Buffalo-Ranch-Dip-Made-With-Avocado-Oil-10-oz/5672823468",
                  "price": 14.58,
                  "title": "Primal Kitchen Buffalo Ranch Dip Made With Avocado Oil 10 oz"
              }
          ]
      },
      {
          "product": "Assorted Chips Variety Pack",
          "results": [
              {      "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/seo/Pringles-Snack-Stacks-Variety-Pack-Potato-Crisps-Chips-Lunch-Snacks-27-Count_db054fb6-96bf-4584-b030-5543d93be638.65473f88658becc774238727b8732256.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
                  "link": "https://www.walmart.com/ip/Pringles-Snack-Stacks-Variety-Pack-Potato-Crisps-Chips-Lunch-Snacks-27-Count/685744035",
                  "price": 13.98,
                  "title": "Pringles Snack Stacks Variety Pack Potato Crisps Chips, Lunch Snacks, 27 Count"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.0",
                  "image": "https://i5.walmartimages.com/seo/Frito-Lay-Classic-Snack-Mix-Variety-Pack-Snack-Chips-42-Count-Multipack_1f04cd09-f6c0-4ff4-b6d7-db7dddf51af7.0f73c8202305f5882a43006a242867d6.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
                  "link": "https://www.walmart.com/ip/Frito-Lay-Classic-Snack-Mix-Variety-Pack-Snack-Chips-42-Count-Multipack/794845701",
                  "price": 19.98,
                  "title": "Frito-Lay Classic Snack Mix Variety Pack Snack Chips, 42 Count Multipack"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "3.2",
                  "image": "https://i5.walmartimages.com/seo/Herr-s-Multi-Potato-Chip-Pack-10-Count_3ff9ff3d-64e4-4ccb-8ede-8c9204047e52.e1e9feb30dcd34eb12e3c46f1c3ac69b.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
                  "link": "https://www.walmart.com/ip/Herr-s-Multi-Potato-Chip-Pack-10-Count/817526855",
                  "price": 12.51,
                  "title": "Herr's Multi Potato Chip Pack- 10 Count"
              }
          ]
      },
      {
          "product": "Mini Pizzas",
          "results": [
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/seo/ThePizzaCupcake-Pepperoni-100-Real-Cheese-Italian-Tomato-Sauce-6-Count-11-45-oz-Frozen_98aa76b3-683f-45b7-a564-7d6883a70528.ddfafc9a23d34eee460a35a548112096.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
                  "link": "https://www.walmart.com/ip/ThePizzaCupcake-Pepperoni-100-Real-Cheese-Italian-Tomato-Sauce-6-Count-11-45-oz-Frozen/644316343?athbdg=L1600",
                  "price": 8.98,
                  "title": "ThePizzaCupcake Pepperoni, 100% Real Cheese, Italian Tomato Sauce, 6 Count, 11.45 oz, Frozen"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/98aa76b3-683f-45b7-a564-7d6883a70528.ddfafc9a23d34eee460a35a548112096.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/ThePizzaCupcake-Pepperoni-100-Real-Cheese-Italian-Tomato-Sauce-6-Count-11-45-oz-Frozen/644316343?athbdg=L1600",
                  "price": 8.98,
                  "title": "ThePizzaCupcake Pepperoni, 100% Real Cheese, Italian Tomato Sauce, 6 Count, 11.45 oz, Frozen"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/1d28ba6f-54b7-4478-8d25-7bc6445d87f5.6e5aa6381f4aef38c97ed9d0552521f9.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Bagel-Bites-Cheese-Pepperoni-Mini-Pizza-Bagel-Frozen-Snack-and-Appetizers-40-Ct-Box-Jumbo/15211677",
                  "price": 9.98,
                  "title": "Bagel Bites Cheese &amp; Pepperoni Mini Pizza Bagel Frozen Snack and Appetizers, 40 Ct Box Jumbo"
              }
          ]
      },
      {
          "product": "Veggie Platter with Dip",
          "results": [
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/cdfa19b5-1aab-4d94-b377-955f812dec6f.a481d9ad1b4088ed632f99f99ff60f1a.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Freshness-Guaranteed-Fresh-Vegetable-Tray-with-Buttermilk-Ranch-Dip-40-oz/662268383",
                  "price": 10.97,
                  "title": "Freshness Guaranteed Fresh Vegetable Tray with Buttermilk Ranch Dip, 40 oz"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/d7effa8f-5533-40c6-9c26-697dba038330.edbdffd967a566219fc599eb6fdc377e.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Organic-Vegetable-Tray-with-Ranch-Dip-40-oz/1184336722",
                  "price": 11.97,
                  "title": "Organic Vegetable Tray with Ranch Dip, 40 oz"
              },
              {    "pid" : "0SJLBGR6ZN6S",
                "rating" : "4.5",
                  "image": "https://i5.walmartimages.com/asr/14de1a8c-5874-47fa-8593-b6a88e146ce8.136d852f80919e019929ad15290afff8.jpeg?odnHeight=180&odnWidth=180&odnBg=ffffff",
                  "link": "https://www.walmart.com/ip/Taylor-Farms-Turkey-Cheese-Vegetable-Tray-with-Ranch-Dip-38-oz-Tray/923335261",
                  "price": 11.97,
                  "title": "Taylor Farms Turkey &amp; Cheese Vegetable Tray with Ranch Dip, 38 oz Tray"
              }
          ]
      }
  ]
}


export default function Home() {
  const [userQuery, setUserQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (newValue: string) => {
    setUserQuery(newValue);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }

    const intervalId = setInterval(() => {
      setPlaceholderIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, 3000); // Change placeholder every 3 seconds

    return () => clearInterval(intervalId);
  }, [messages]);

  const sendMessage = async (message: string) => {
    setIsLoading(true);
    if (message.trim() === "") return;

    setMessages(prevMessages => [...prevMessages, { type: 'user', text: message }]);

    try {
      const response = await fetch('http://localhost:8000/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Response from backend', data);

        setMessages(prevMessages => [...prevMessages, { type: 'bot', text: data.assistant_response, results: data.results }]);

        setIsLoading(false);
      } else {
        console.error('Error in response:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
      <main className="flex min-h-screen flex-col items-center px-14 py-24">
        <section ref={chatContainerRef} className="w-full md:w-3/4 lg:w-2/3 h-full flex flex-col gap-3 overflow-y-auto ">
          {messages.map((message, index) => (
            <div key={index} className="flex flex-row gap-3 my-2 z-40">
              <Avatar className='z-20'>
                <AvatarImage src={message.type === 'user' ? "./OIP.jpeg" : "./user.png"} />
                <AvatarFallback>{message.type === 'user' ? "CN" : "BOT"}</AvatarFallback>
              </Avatar>
              <div className='text-xs md:text-base'>
                <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                
                {/* <Markdown remarkPlugins={[remarkGfm]}>{data.assistant_response}</Markdown> */}


{/* product card rendering */}

                {message.results && message.results.map((productResult, productIndex) => (

                // {data.results && data.results.map((productResult, productIndex) => (

             
                 

                  <div key={productIndex} className='flex flex-col my-2'>
                    <h4 className='font-bold text-[#7C7C7C] text-lg mt-2 mx-4'>{productResult.product}</h4>
                    <div className='flex flex-row'>

                    {productResult.results.map((product, itemIndex) => (
                      <div key={parseFloat(product.rating)} className="flex flex-row mt-2">
                             <Link href={product.link} target='_blank' >
                   <Card className="w-[220px] mx-2 my-1 border-none hover:shadow-lg  transition  shadow-none">
                   <CardContent>
                  <Image src={product.image} alt="pdt image" width={150} height={50} className=' mx-auto mt-3'/>
                    </CardContent>

                    <CardFooter className="flex flex-col items-start gap-2">
                      <p className='text-[15px] font-semibold '>{product.title.length > 19 ? product.title.substring(0,19) + '...' : product.title}</p>
                      <div className='flex flex-row gap-6'>
                      <p className='text-sm font-medium  text-blue-800 bg-blue-100 px-[4px] py-[0.5px] rounded-sm inline-block'>${product.price.toFixed(2)}</p>
                      {product.rating !== "0.0" && <StarRating rating={product.rating} />}


                      </div>
                    </CardFooter>

                  </Card>
                      </Link>
                      </div>
                    ))}
                    </div>
                  </div>
                
                ))}
              </div>
            </div>
          ))}


{/* loader */}
          {isLoading && (
          <Loader/>
          )}

        </section>
      </main>


{/* footer - chat input  */}
      <footer className="flex justify-center z-40 bg-white mt-3">
        <div className="my-2 p-2 mx-2 w-full md:w-3/4 lg:w-2/3 fixed bottom-0 z-40 bg-white">
          <div className="flex flex-row gap-2 border-[1.5px] border-blue-500 justify-center py-2 px-4 rounded-full z-40 bg-white">
            <input
              type="text"
              value={userQuery}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e.target.value)}
              className="w-full border-none outline-none z-50 text-xs md:text-sm lg:text-base"
              placeholder={placeholders[placeholderIndex]}
            />
            <Button type="submit" className="rounded-full font-semibold" onClick={() => { sendMessage(userQuery); setUserQuery(""); }}>
              <LuSend className="text-lg text-yellow-400 font-semibold" />
            </Button>
          </div>
        <p className='text-[11px] items-center text-center mt-1'>Disclaimer :The responses are AI-Generated. It may contain mistakes.</p>
        </div>
      </footer>
    </>
  );
}
