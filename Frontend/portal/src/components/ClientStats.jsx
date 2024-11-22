import React from 'react';
import { QuoteComponent } from './QuoteComponent';
import { Carousel } from "flowbite-react";

function ClientStats() {
  const clientsReached = 1234;
  const hoursSolved = 5678;
  const Quotes = [
    {
        quote:"Your team was incredibly helpful and efficient.",
        user: {
            Name:"Josh Petrova",
            ProPic:"https://flowbite.com/docs/images/people/profile-picture-1.jpg",
            School:"Oakwood Academy"
        }
    },
    {
        quote:"I was impressed by the level of expertise and professionalism.",
        user:{
            Name:"Kai Nakamura",
            ProPic:"https://flowbite.com/docs/images/people/profile-picture-2.jpg",
            School:"Willow Creek High School"
        }
    },
    {
        quote:"I would highly recommend your services.",
        user:{
            Name:"Isabella Martinez",
            ProPic:"https://flowbite.com/docs/images/people/profile-picture-3.jpg",
            School:"Pine Grove Elementary"
        }
    }
  ];

  return (
    <section className="bg-[#E9F0CD] shadow-md md:w-[73%] mx-2 my-4 md:my-5 p-6 flex xl:flex-row flex-col justify-between items-center">
  <div>
    <h2 className="text-3xl font-bold text-center mb-8">Our Impact</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
        <h3 className="text-2xl font-semibold">Lessons managed</h3>
        <p className="text-4xl font-bold">{clientsReached}</p>
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
        <h3 className="text-2xl font-semibold">Teachers Assisted</h3>
        <p className="text-4xl font-bold">{clientsReached}</p>
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-blue-500 text-white rounded-lg">
        <h3 className="text-2xl font-semibold">Schools managed</h3>
        <p className="text-4xl font-bold">{clientsReached}</p>
      </div>
      <div className="flex flex-col items-center justify-center p-4 bg-green-500 text-white rounded-lg">
        <h3 className="text-2xl font-semibold">Hours Solved</h3>
        <p className="text-4xl font-bold">{hoursSolved}</p>
      </div>
    </div>
  </div>
  <div className="text-center mt-8 md:mt-0">
    <div className="h-56 sm:h-64 xl:h-80 2xl:h-96 mx-auto w-[28rem]">
      <Carousel leftControl=" " rightControl=" ">
        {Quotes.map((quote, index) => (
          <li key={index}>
            <QuoteComponent Quote={quote} />
          </li>
        ))}
      </Carousel>
    </div>
  </div>
</section>
  );
}

export default ClientStats;