'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LuSend } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton"
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'


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
  "Ask - Number of invoices per country?",
  "Ask - Which sales agent made the most in sales overall?",
  "Ask - Show the most purchased track of 2013?",
  "Ask - Give Total sales per country. Which country's customers spent the most?",
  "Ask - List Top 5 most purchased tracks overall?",
  "Ask - Who are the Top 3 best selling artists?",
  "Ask - Which is the most purchased Media Type?"
];

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
                <AvatarImage src={message.type === 'user' ? "./blume.png" : "./user.png"} />
                <AvatarFallback>{message.type === 'user' ? "CN" : "BOT"}</AvatarFallback>
              </Avatar>
              <div className='text-xs md:text-base'>
                <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>

{/* product card rendering */}
                {message.results && message.results.map((productResult, productIndex) => (
                   
                  //  <div key={productIndex}>
             
                 

                  <div key={productIndex} className='flex flex-row mt-3'>
                    <h4>{productResult.product}</h4>
                    {productResult.results.map((product, itemIndex) => (
                      <div key={itemIndex} className="flex flex-row mt-3 gap-4 ">
                             <Link href={product.link} target='_blank' >
                   <Card className="w-[270px]">
                   <CardContent>
                  <Image src={product.image} alt="pdt image" width={40} height={30}/>
                    </CardContent>
                    <CardFooter className="flex ">
                      <p>{product.title.length > 15 ? product.title.substring(0,15) + '....' : product.title}</p>
                    </CardFooter>
                      <p>Price: ${product.price.toFixed(2)}</p>
                  </Card>
                      </Link>
                      </div>
                    ))}
                  </div>
                
                ))}
              </div>
            </div>
          ))}


{/* loader */}
          {isLoading && (
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full bg-slate-200" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px] bg-slate-200" />
                <Skeleton className="h-4 w-[200px] bg-slate-200" />
              </div>
            </div>
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
            <Button type="submit" className="rounded-full" onClick={() => { sendMessage(userQuery); setUserQuery(""); }}>
              <LuSend className="text-lg" />
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
