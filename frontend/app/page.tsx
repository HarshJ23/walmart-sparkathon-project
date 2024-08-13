'use client'
import React, { useState, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { LuSend } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from '@/components/shared/StarRating';
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Loader from '@/components/shared/Loader';
import HomeStarter from '@/components/shared/HomeStarter';

// card component imports
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import Link from 'next/link';
import Image from 'next/image';

// tool component
import Tool from "@/components/shared/Tool";

interface Product {
  image: string;
  link: string;
  price: number;
  title: string;
  rating: string;
  pid: string;
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
  "Ask - Want to buy some t-shirts",
  "Ask - Recipe and items to cook roasted duck?",
  "Ask - Plan snacks for a football watch party at my house",
  "Ask - Comfortable shorts for football.",
  "Ask - I'm an avid football fan. what type of tv suits best to me?",
  "Ask - What type of jackets might be good for me?",
  "Ask - Suggest some good socks for soccer."
];

const data = [
  {
      "product": "Men's Fleece Full-Zip Jacket",
      "results": []
  },
  {
      "product": "Men's Fleece Pullover Hoodie",
      "results": [
          {
              "image": "https://i5.walmartimages.com/seo/Real-Essentials-3-Pack-Men-s-Fleece-Pullover-Hoodie-Long-Sleeve-Hooded-Sweatshirt-Pockets-Available-in-Big-Tall_9297a372-f9e9-4d19-b907-81c9623fa552.c29a94bc73648324e096e9be60f8d366.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
              "link": "https://www.walmart.com/ip/Real-Essentials-3-Pack-Men-s-Fleece-Pullover-Hoodie-Long-Sleeve-Hooded-Sweatshirt-Pockets-Available-in-Big-Tall/5019546884",
              "pid": "1SG4TIGAB0HL",
              "price": 43.99,
              "rating": 0,
              "title": "Real Essentials 3 Pack: Men's Fleece Pullover Hoodie - Long Sleeve Hooded Sweatshirt Pockets (Available in Big &amp; Tall)"
          },
          {
              "image": "https://i5.walmartimages.com/seo/Essentials-Hoodie-for-Men-Women-Teens-Letter-Fleece-Couples-Hoodies-Sweatshirt-Hip-Hop-Loose-Unisex-Hooded-Pullover-Streetwear_52695915-e18a-408d-824b-d6e67f30e6bf.4e200c1b29e06ddd53e441c643fbd9ae.webp?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
              "link": "https://www.walmart.com/ip/Essentials-Hoodie-for-Men-Women-Teens-Letter-Fleece-Couples-Hoodies-Sweatshirt-Hip-Hop-Loose-Unisex-Hooded-Pullover-Streetwear/8150165982",
              "pid": "415OMMN9Q25C",
              "price": 49.99,
              "rating": 0,
              "title": "Essentials Hoodie for Men Women Teens, Letter Fleece Couples Hoodies Sweatshirt, Hip Hop Loose Unisex Hooded Pullover Streetwear"
          },
          {
              "image": "https://i5.walmartimages.com/seo/HISITOSA-Fleece-Hoodies-for-Men-Cowl-Neck-Sweatshirts-Casual-Pullover-Fall-Winter-Loose-Fit-Tops-with-Embroidery_2ebd1025-6fb7-45f3-a46c-4c9bba607a3b.9f97a2199a70142dd2c8d86649d6133f.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
              "link": "https://www.walmart.com/ip/HISITOSA-Fleece-Hoodies-for-Men-Cowl-Neck-Sweatshirts-Casual-Pullover-Fall-Winter-Loose-Fit-Tops-with-Embroidery/5286186157",
              "pid": "5GEYOVUIXUVC",
              "price": 42.99,
              "rating": 0,
              "title": "HISITOSA Fleece Hoodies for Men Cowl Neck Sweatshirts Casual Pullover Fall Winter Loose Fit Tops with Embroidery"
          }
      ]
  },
  {
      "product": "Men's Performance Fleece Jacket",
      "results": []
  },
  {
      "product": "Men's Sherpa-Lined Fleece Jacket",
      "results": [
          {
              "image": "https://i5.walmartimages.com/seo/Barabas-Men-s-black-grey-checkered-wool-Sherpa-Lined-liner-jacket-BH56_819c077d-0a00-4f07-9c4e-557e20b0278a.e7e5961a87e5185d36fea956c8fd9e85.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
              "link": "https://www.walmart.com/ip/Barabas-Men-s-black-grey-checkered-wool-Sherpa-Lined-liner-jacket-BH56/2249950912",
              "pid": "7ISYRFCU2C4M",
              "price": 109,
              "rating": 0,
              "title": "Barabas Men's black grey checkered wool Sherpa-Lined liner jacket BH56"
          }
      ]
  }
]

export default function Home() {
  const [userQuery, setUserQuery] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState<number>(0);
  const [category, setCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUserQuery(e.target.value);
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
      const response = await fetch('http://127.0.0.1:8000/shop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: message,
        }),
      });

      if (response.ok) {
        const data: { assistant_response: string; results: ProductResult[]; category: string } = await response.json();
        console.log('Response from backend', data);

        setMessages(prevMessages => [...prevMessages, { type: 'bot', text: data.assistant_response, results: data.results }]);
        setIsLoading(false);
        setProducts(data.results.flatMap(productResult => productResult.results));
        setCategory(data.category);

      } else {
        console.error('Error in response:', response.statusText);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <>
    <div className='p-4 mx-4 mt-2 fixed top-0 '>
      <p className='font-extrabold italic text-xl hover:cursor-pointer drop-shadow-xl text-primary'><span className='text-yellow-400'>Mr.</span>Sam</p>
    </div>
      <main className="flex min-h-screen flex-col items-center px-14 py-24">
        <section ref={chatContainerRef} className="w-full md:w-3/4 lg:w-2/3 h-full flex flex-col gap-3 overflow-y-auto">
        {messages.length == 0 && 
        <HomeStarter/>
        }
          {messages.map((message, index) => (
            <div key={index} className="flex flex-row gap-3 my-2 z-40">
              <Avatar className='z-20'>
                <AvatarImage src={message.type === 'user' ? "./useres.png" : "./user2.png"} />
                <AvatarFallback>{message.type === 'user' ? "CN" : "BOT"}</AvatarFallback>
              </Avatar>
              <div className='text-xs md:text-base'>
                <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown>
                {message.results && message.results.map((productResult: ProductResult, productIndex: number) => (
                  <div key={productIndex} className='flex flex-col my-2'>
                   {productResult.results.length !== 0 ? <h4 className='font-bold text-[#7C7C7C] text-lg mt-2 mx-4'>{productResult.product}</h4> : null }
                    <div className='flex flex-row'>
                      {productResult.results.map((product: Product) => (
                        <div key={product.pid} className="flex flex-row mt-2">
                          <Link href={product.link} target='_blank'>
                            <Card className="w-[220px] mx-2 my-1 border-none hover:shadow-lg transition shadow-none">
                              <CardContent>
                                <Image src={product.image} alt="pdt image" width={150} height={50} className='mx-auto mt-3' />
                              </CardContent>
                              <CardFooter className="flex flex-col items-start gap-2">
                                <p className='text-[15px] font-semibold '>{product.title.length > 19 ? product.title.substring(0, 19) + '...' : product.title}</p>
                                <div className='flex flex-row gap-6'>
                                  <p className='text-sm font-medium text-blue-800 bg-blue-100 px-[4px] py-[0.5px] rounded-sm inline-block'>${product.price.toFixed(2)}</p>
                                  {product.rating ? <StarRating rating={product.rating} /> : null}
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

          {isLoading && (
            <Loader />
          )}
        </section>
      </main>

      <footer className="flex justify-center z-40 bg-white mt-3">
        <div className="my-2 p-2 mx-2 w-full md:w-3/4 lg:w-2/3 fixed bottom-0 z-40 bg-white">
          <div className="flex flex-row gap-2 border-[1.5px] border-blue-500 justify-center py-2 px-4 rounded-2xl z-40 bg-white">
            <input
              type="text"
              value={userQuery}
              onChange={handleInputChange}
              className="w-full border-none outline-none z-50 text-xs md:text-sm lg:text-base"
              placeholder={placeholders[placeholderIndex]}
            />
            {category == "Fashion&Clothing"  && <Tool toolcat={category} products={products} />}
            <Button type="submit" className="rounded-xl font-semibold transition ease-in-out" onClick={() => { sendMessage(userQuery); setUserQuery(""); }}>
              <LuSend className="text-lg text-white font-semibold" />
            </Button>
          </div>
          <p className='text-[11px] items-center text-center mt-1'>Disclaimer: The responses are AI-Generated. It may contain mistakes.</p>
        </div>
      </footer>
    </>
  );
}