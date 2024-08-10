import React, { useState, ChangeEvent, FormEvent } from 'react';
import { storage } from '@/firebaseconfig'; // Adjust the import path as needed
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Image from 'next/image';
import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';
// import Image from 'next/image'

interface Product {
  image: string;
  link: string;
  price: number;
  title: string;
  rating: string;
  pid: string;
}

interface TryonProps {
  products: Product[];
}


// products = [
//   {
//       "product": "Men's Waterproof Jacket",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/ZCFZJW-Men-s-Hooded-Windproof-Water-Resistant-Rain-Jacket-Windbreaker-Three-In-One-Two-Piece-Outdoor-Overcoat-Pockets-Hiking-Fishing-Running-Black-XX_ed1f78b0-6e0a-4022-98f1-f912398305ea.966f11beb18ce5421c072080f802a0bf.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/ZCFZJW-Men-s-Hooded-Windproof-Water-Resistant-Rain-Jacket-Windbreaker-Three-In-One-Two-Piece-Outdoor-Overcoat-Pockets-Hiking-Fishing-Running-Black-XX/5099191261",
//               "pid": "1WQVFYHN76R5",
//               "price": 72.49,
//               "rating": 0,
//               "title": "ZCFZJW Men's Hooded Windproof Water Resistant Rain Jacket Windbreaker Three-In-One Two-Piece Outdoor Overcoat with Pockets for Hiking,Fishing,Running Black XXXXL"
//           },
//           {
//               "image": "https://i5.walmartimages.com/asr/7bce7b3f-ad2e-41ca-bd7d-fa3e360f64e9.7a83048b63e2233c20856b36cc1d81b9.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Men-Casual-Patchwork-Thicken-Multi-Pocket-Hooded-Zipper-Windproof-Waterproof-Breathable-Jacket-Coats/1705502263",
//               "pid": "7E3VDQ15F4TD",
//               "price": 0,
//               "rating": 0,
//               "title": "Men Casual Patchwork Thicken Multi Pocket Hooded Zipper Windproof Waterproof Breathable Jacket Coats"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Mens-Casual-Waterproof-Hiking-Jackets-Tacti-cal-Jacket-Men-Multi-pocket-Hooded-Outdoor-Camping-Coat_b1cf14b7-df08-44b9-b6be-9d537f87d7ef.9e9001ade6d03db9a2b7b93c08e4f949.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Mens-Casual-Waterproof-Hiking-Jackets-Tacti-cal-Jacket-Men-Multi-pocket-Hooded-Outdoor-Camping-Coat/2233416155",
//               "pid": "77REX1AAGMUH",
//               "price": 53.72,
//               "rating": 1,
//               "title": "Mens Casual Waterproof Hiking Jackets Tacti-cal Jacket Men Multi-pocket Hooded Outdoor Camping Coat"
//           }
//       ]
//   },
//   {
//       "product": "Men's Denim Jacket",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/Frontwalk-Jean-Jacket-for-Men-Classic-Slim-Fit-Button-Down-Denim-Jacket-Casual-Long-Sleeve-Lapel-Outwear-Tops_b5f8a794-38fd-44bc-a9e1-ca4e6aced6d3.9215a15a7a51b8af1c85801fad11321c.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Frontwalk-Jean-Jacket-for-Men-Classic-Slim-Fit-Button-Down-Denim-Jacket-Casual-Long-Sleeve-Lapel-Outwear-Tops/353789573",
//               "pid": "7ET58HXEFLC4",
//               "price": 46.99,
//               "rating": 1.8,
//               "title": "Frontwalk Jean Jacket for Men Classic Slim Fit Button Down Denim Jacket Casual Long Sleeve Lapel Outwear Tops"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Alpine-Swiss-Derek-Mens-Classic-Denim-Jacket-Casual-Button-Up-Jean-Trucker-Coat_b4888eb9-2e92-4c9c-86cb-db12c517fe48.8107142be87304475488efcc2afa8ab7.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Alpine-Swiss-Derek-Mens-Classic-Denim-Jacket-Casual-Button-Up-Jean-Trucker-Coat/576546706",
//               "pid": "6IX8FDHR5GRS",
//               "price": 59.99,
//               "rating": 4.2,
//               "title": "Alpine Swiss Derek Mens Classic Denim Jacket Casual Button Up Jean Trucker Coat"
//           },
//           {
//               "image": "https://i5.walmartimages.com/asr/a8fe2d69-28d4-4ae8-9caa-2ace24e09bef.3b5b4ef8d9489f9c53fee39b92968451.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Victorious-Men-s-Classic-Colored-Denim-Jean-Jacket/775892808",
//               "pid": "1115UTLRZF30",
//               "price": 45.98,
//               "rating": 5,
//               "title": "Victorious Men's Classic Colored Denim Jean Jacket"
//           }
//       ]
//   },
//   {
//       "product": "Men's Bomber Jacket",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/asr/1bf48632-da9c-4072-b8da-0db12be79261.2603defbb1bd367375b1d30cbfea7f74.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Aayomet-Big-Mens-Winter-Coats-Heavyweight-Thicken-Warm-Windproof-Hooded-Snowboard-Parka-Insulated-Jackets-Puffer-Outwear-Men-Green-XL/2281494524",
//               "pid": "4ZD6PU4MDMKN",
//               "price": 78.89,
//               "rating": 0,
//               "title": "Aayomet Big Mens Winter Coats Mens Heavyweight Thicken Warm Coats Windproof Hooded Winter Snowboard Parka Insulated Jackets Puffer Outwear for Men,Green XL"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Mens-Bomber-Jackets-Lightweight-Outdoor-Sports-Jacket-Overcoat-Fall-Winter-Zip-Up-Pockets-Coat-Casual-Loose-Outwear-Tops-Summer-Saving_b461f6a1-7086-4f61-9d16-3542896c1843.22350a425f51055f3671ffb00cf38183.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Mens-Bomber-Jackets-Lightweight-Outdoor-Sports-Jacket-Overcoat-Fall-Winter-Zip-Up-Pockets-Coat-Casual-Loose-Outwear-Tops-Summer-Saving/7445820082",
//               "pid": "4ZPOS1GIVTUV",
//               "price": 64.11,
//               "rating": 0,
//               "title": "Mens Bomber Jackets Lightweight Outdoor Sports Jacket Overcoat Fall Winter Zip Up Pockets Coat Casual Loose Outwear Tops Summer Saving"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Mens-Bomber-Jackets-Lightweight-Fall-Winter-Zip-Up-Pockets-Coat-Overcoat-Outdoor-Sports-Jacket-Casual-Loose-Outwear-Tops-Fall-Saving_e08eb0ad-c56f-46c6-9d1f-6c20f1357e31.bb7ebf4d63734bafc0c92d9e4b0d4c0c.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Mens-Bomber-Jackets-Lightweight-Fall-Winter-Zip-Up-Pockets-Coat-Overcoat-Outdoor-Sports-Jacket-Casual-Loose-Outwear-Tops-Fall-Saving/7442562806",
//               "pid": "5KDPPPPKGVK8",
//               "price": 85.06,
//               "rating": 0,
//               "title": "Mens Bomber Jackets Lightweight Fall Winter Zip Up Pockets Coat Overcoat Outdoor Sports Jacket Casual Loose Outwear Tops Fall Saving"
//           }
//       ]
//   },
//   {
//       "product": "Men's Puffer Jacket",
//       "results": [
//           {
//               "image": "https://i5.walmartimages.com/seo/WenVen-Men-s-Winter-Coat-Windproof-Puffer-Jacket-Hooded-Warm-Ski-Coat-Green-L_10bfde56-ee65-4242-a208-7d2eb91bf87a.56308e927ab2dc28c3c4956eb0d1767c.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/WenVen-Men-s-Winter-Coat-Windproof-Puffer-Jacket-Hooded-Warm-Ski-Coat-Green-L/637919821?athbdg=L1700",
//               "pid": "5OY68ZPPMCWX",
//               "price": 75.99,
//               "rating": 0,
//               "title": "WenVen Men's Winter Coat Windproof Puffer Jacket Hooded Warm Ski Coat Green L"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/Freeze-Defense-Warm-Men-s-3in1-Winter-Jacket-Coat-Parka-Vest-Medium-Red_ccb2c175-ed3f-4bb2-ac01-bec78425653b.d6e14882c7ee4ac0c97fe5c5dbe5cf6e.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/Freeze-Defense-Warm-Men-s-3in1-Winter-Jacket-Coat-Parka-Vest-Medium-Red/209228425?athbdg=L1600",
//               "pid": "1YFLXQNTMERK",
//               "price": 119.99,
//               "rating": 0,
//               "title": "Freeze Defense Warm Men's 3in1 Winter Jacket Coat Parka &amp; Vest (Medium, Red)"
//           },
//           {
//               "image": "https://i5.walmartimages.com/seo/WenVen-Men-s-Winter-Coat-Warm-Puffer-Jacket-Hooded-Waterproof-Parka-Coat-Black-M_b973382e-8509-43a9-a85d-35593e63b87f.3672409cdd9cd1b99a60756c3c8d7517.jpeg?odnHeight=180&odnWidth=180&odnBg=FFFFFF",
//               "link": "https://www.walmart.com/ip/WenVen-Men-s-Winter-Coat-Warm-Puffer-Jacket-Hooded-Waterproof-Parka-Coat-Black-M/275124695",
//               "pid": "6VS1OIVXKLPK",
//               "price": 71.99,
//               "rating": 4.7,
//               "title": "WenVen Men's Winter Coat Warm Puffer Jacket Hooded Waterproof Parka Coat Black M"
//           }
//       ]
//   }
// ]

const Tryon: React.FC<TryonProps> = ({ products }) => {

const [image, setImage] = useState<File | null>(null);
const [imageUrl, setImageUrl] = useState<string>('');
const [selectedProductUrl, setSelectedProductUrl] = useState<string>('');
const [resultImage , setResultImage] = useState<string>('');
const [isLoading , setIsLoading] = useState(false);

  const handleImageUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!image) return;

    const imageRef = ref(storage, `images/${image.name}`);
    try {
      await uploadBytes(imageRef, image);
      const url = await getDownloadURL(imageRef);
      setImageUrl(url);
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error("Error uploading image: ", error);
      alert('Failed to upload image.');
    }
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  const handleProductClick = (productUrl: string) => {
    const cleanedUrl = productUrl.split('?')[0];

    console.log(cleanedUrl);
    setSelectedProductUrl(cleanedUrl);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!imageUrl || !selectedProductUrl) {
      alert('Please upload an image and select a product.');
      return;
    }

    // const requestBody = {
    //   userImageUrl: "https://i5.walmartimages.com/seo/Athletic-Works-Men-s-Fleece-Full-Zip-Hoodie-Jacket_f75cb628-2463-4d5e-b906-e11ad8196b55.c760c7c06748eeae398ffdd2b8b3d8e8.jpeg",
    //   productImageUrl: selectedProductUrl,
    // };

    // Make your API call here with requestBody
    // console.log('Request Body:', requestBody);
    // alert('API call can be made with the request body.');
  };


  const clothtry = async() =>{
setIsLoading(true);
    try {
      const response = await fetch(' http://127.0.0.1:8000/virtual-try-on' , {
        method : 'POST',
        headers : {
          'Content-type' : 'application/json',
        },
        body : JSON.stringify({
          avatar_image_url: "https://i5.walmartimages.com/seo/Athletic-Works-Men-s-Fleece-Full-Zip-Hoodie-Jacket_f75cb628-2463-4d5e-b906-e11ad8196b55.c760c7c06748eeae398ffdd2b8b3d8e8.jpeg",
          clothing_image_url: selectedProductUrl,
        })
      })

      
      if (!response.ok) {
        throw new Error('API call failed');
      }

      const data = await response.json();
      setResultImage(`data:${data.content_type};base64,${data.image}`);
    } catch (error) {
      console.error('Error calling virtual try-on API:', error);

    }

    setIsLoading(false);
  }
  

  return (
    <div className="overflow-y-scroll min-h-screen max-h-screen h-full p-2   mb-6">
      <p className='text-base font-semibold'>Virtual Try-on</p>
      <p className='text-sm text-gray-400'>Offline-store like experience, try clothes and share it with anyone.</p>

      <div className='flex flex-col my-6 gap-4'>
        {/* select dress section */}
        <div>
          <p className='text-base font-semibold'>1) Select the dress you want to try:</p>
          <div className="flex overflow-x-auto space-x-4 mt-2">
            {/* Render your products here */}
            {products.map((product) => (
              <div key={product.pid} className={`flex-shrink-0 cursor-pointer p-2 rounded-md ${selectedProductUrl === product.image.split('?')[0] ? 'bg-blue-200' : 'bg-white'}`} onClick={() => handleProductClick(product.image)}>
                                <p className='text-[15px] font-semibold '>{product.title.length > 12 ? product.title.substring(0, 12) + '..' : product.title}</p>
                                <Image src={product.image} alt={product.title} width={130} height={130} />
              </div>
            ))}
          </div>
        </div>

        {/* upload your pic section */}
        <form className='flex flex-col mt-4' onSubmit={handleImageUpload}>
          <p className='text-base font-semibold'>2) Upload your picture:</p>
          <input
            type="file"
            name="look_image"
            id="img"
            accept="image/*"
            className='mt-1 file:rounded-md file:p-1 file:text-sm file:font-medium file:hover:cursor-pointer file:border-none file:shadow-sm file:bg-primary file:px-3 file:py-2 file:text-white'
            onChange={handleImageChange}
          />
          <Button type="submit" className='mt-3'>Upload</Button>
        </form>

        {/* {imageUrl && (
          <div className='mt-4'>
            <p className='text-base font-sm'>Uploaded Image:</p>
            <Image src={imageUrl} alt="Uploaded" className='mt-2 rounded-md' height={20} width={20} />
          </div>
        )} */}


        <Button onClick={clothtry} className='mb-24'>Create your look</Button>
        
        {isLoading ? <div className='flex flex-col items-center mb-32 gap-8'>
<p className='font-bold text-lg'> Generating your look ..</p>
<Spinner size="small" />
</div> : null}



        {/* <div className='flex flex-col items-center'>
        <p className='font-bold text-lg'>Result</p>
        <Image src={resultImage} alt="Try-on Result" className='mt-2 rounded-md' width={200} height={200} />
        </div> */}

        {resultImage ?   <div className='flex flex-col items-center mb-32'>
        <p className='font-bold text-lg'>Result</p>
        <Image src={resultImage} alt="Try-on Result" className='mt-2 rounded-md' width={200} height={200} />
        </div> : null }

        
       
        </div>
    </div>
  );
}

export default Tryon;
