# BLOG
## Built using: 
- React JS
- TailwindCSS
- Node JS
- PostgresQL
- React DevTools
- Cloudflare
- Koyeb
- Supabase

A clean, mobile-friendly place to write and like posts, follow people, and talk in comments.

Try it out! https://blog-3ec.pages.dev/

Please note that the server will need to start up if it has been inactive for some time, so it may take a moment for your actions to register initially. 

## Table of contents
- [The Inspiration](#the-inspiration)
- [TechStack](#techstack)
- [Features](#features)
- [Journey](#journey)

---

## The Inspiration
The best way to learn is to dive in. Gaining hands-on experience, figuring things out as you go, and seeing real progress while working toward a goal you care about are what fuel motivation.

When I started building BLOG, I wanted a space to speak freely about my courses and projects. I also wanted others to join the conversation and comment on my experiences. That initial idea grew into what BLOG is today: a place where anyone can write posts, follow other users, and build communities around their posts.

The tech choices were intentional. As a Computer Science student looking for an internship, I wanted experience with databases, React, Tailwind CSS, and hosting. I researched and landed on Cloudflare for the frontend, Koyeb for the backend, and Supabase for a PostgreSQL database. This project has helped me learn so much about web development, and I am truly glad I picked it up. 

---

## TechStack
- **Frontend:** React, TailwindCSS, React DevTools
  - React and TailwindCSS allowed me to create a dynamic, responsive, and user friendly frontend for BLOG. React DevTools helped a ton with debugging. 
- **Backend:** Node.js
  - Node JS gave me an easy way to host the backend for the server. This was how my frontend was able to communicate with the database. 
- **Database:** PostgreSQL
  - PostgresQL provided me with a fast and easy way to post and fetch data from the database. 
- **Infra/Hosting:**
  - Cloudflare: Free hosting for the frontend - fairly easy to set up.
  - Koyeb: Free hosting for the backend - extremely easy to set up.
  - Supabase: Free hosting for the database - fairly easy to set up.

---

## Features
- **Posts:** create, edit, delete, comment, and like
- **Comments:** comments on posts
- **Following:** follow, unfollow, following/global feeds for posts
- **Search:** search by post text, search for users
- **Auth:** secure JWT cookie tokens
- **Responsive UI:** different site styling based on screen size

---

## Journey
- [Initial Publish](#august-21-2025-initial-publish)
- [Update 1.00](#august-29-2025-update-1.00)
- [Bugfix 1.01](#september-20-2025-bugfix-1.01)

### <a id="august-21-2025-initial-publish"></a> August 21, 2025 (initial publish):
I started by designing the basic page layout and navigation bar for the page. This part was fairly simple as it was just js/html code. 

The next step in creating BLOG was to make the database on MySQLWorkbench. I made all of the necessary tables and hosted the SQL server from my device. I then linked the signin/signup pages to the database, making sure that accounts could be created and signed into. 

Next, I created the profile page for the user. The goal of this page was to allow the user to check their own profile. Since this page showed the user their own profile, it needed the user to be signed in, which is why the next task on my list was user authentication. I used session cookies with JsonWebToken for this. I tested this by displaying a message that welcomed the user and used their username. I also made a logout button that removes the session cookies and sends the user back to the signin page. 

After, I created the page that allowed users to make their own posts. This also required authentication. Then, I created the react element that displays the posts that it fetches from the database on the homepage. Next, I made it so clicking a post opens its own page, displaying the single post and its comments under it. This page also has the form to create a new comment under the post. 

Next, I made it so the profile displayed the signed in user's posts. From here, I added edit and delete options on the user's posts. I made sure that the edit time was also displayed on posts that were edited, alongside the already displayed creation date. 

Now, I wanted to make the token session holding stronger, so I added an autotimeout that booted the user to the signin page after their session expired. I also made it so the user could not force their way into the site by changing the url from the signin page. I did this by changing my routing to require authentication before sending the user to protected pages. I also changed the allowed origins for the site to allow my desktop to connect. 

Then, I added functionality to the search bar, making it display posts that match the text searched. I also added less relevant matches to the display, with these displayed below the exact matches. 

Now it was time to let people connect with each other. I started by changing the way the profile element worked, instead making it return the profile of the requested user. I changed the navigation bar to request the signed in user's profile. I made the post author names clickable, linking it to the post author's profile. Then I added user search to the navigation bar, allowing people to find users by searching their names and open their profiles. I made this search query live, so it would auto display results as the user typed in the search bar. Next came the follow feature. I chose to use one directional follows, similar to Instagram and Twitter (X). Then, I added "Followers" and "Following" buttons on user profiles to open a list of the users that fall under the category. I added "remove" and "unfollow" buttons to their respective lists, letting the user control their community. 

Next, I modularized the backend. This involved splitting up my index.js file into files for categories of functions and database calls.

Then, I created different feeds for the main page, letting users decide whether they wanted to see posts from their following list, or from the global feed. Since the user needs to be logged in for them to have a "following" feed, I added an error message for users whose sessions have expired, instructing them to either sign in again, or to view the global feed instead. At this point, I also realized that the posts, comments, and usernames could contain anything the user typed in, so I implemented a profanity check. I added censoring to posts with hateful or derogatory words, and I rejected usernames which contained these. 

Now came hosting. This part took a long time. I started with Supabase for the database. I created a new database and implemented all of the tables that I had on my hosted SQL serer. Next, I moved to Koyeb for my backend. The biggest issue I faced while doing this was updating my SQL database functions to handle PostgresQL (pg) calls instead. After this, the backend was live! Next came Cloudflare for the frontend. After a number of dependency and CORS issues, my website was live, but this was not the end of my work related to hosting. After this, I had to make sure that I could still develop locally on my device without changing all of my database calls manually every time. This involved setting up a check for whether the site was being run on Cloudflare or locally, and then adapting the server calls to the required location. After this, I added mobile support, restyling the elements to work on any screen size. After a few more small design changes (Toasts, time zones, website logo and description), I was ready to call hosting complete. 

### <a id="august-29-2025-update-1.00"></a> August 29, 2025 (Update 1.00):
After showing BLOG to my parents and a few friends, I had received some pieces of feedback. This feedback included changes to the onboarding process, a lack of interaction between users and posts, and just some general bugfixes. 

First, I started with the onboarding changes. This started with centering the buttons and adding a guest mode. The guest mode feature was one that I came up with for an easy introduction to BLOG. The initial requirement to create an account but the burden of action on the user, and when introducing them a new product, the user should not be the one having to do the work. With the addition of guest mode, the user has a way to get an idea of what they are signing themselves up for, and they only have to create an account to perform actions that need a user to point back to (creating posts/comments, liking posts, following users). 

Next came making the global feed the default, this was previously the following feed. This change came naturally following the addition of guest mode, as introducing a new user to an empty page is not a very good experience. Letting the user explore and see other's posts first was a much better beginning. 

Now, I added some QOL changes to the signup process. I had been given feedback to add a password confirmation so the user doesn't accidentally mistype their password when signing up and get locked out. I added a live message for whether the passwords typed matched. 

The biggest feature added in this update was the ability to like posts. Users can now show their support by adding a thumbs up to posts they enjoyed. This feature requires the user to be signed in. 

Lastly, I changed the cancel button on the add post page to navigate the user to the page they were previously on, and if no such page is found, they are directed to the homepage. 

There are plenty more features I plan to add, so stay tuned!

### <a id="september-20-2025-bugfix-1.01"></a> September 20, 2025 (Bugfix 1.01):
After using BLOG for some time, I found a small but annoying bug with the guest mode feature. Sometimes when you would click the button to use BLOG as a guest, the site would let you in, and then kick you out, requiring you to click the button again. With no error or warning message, this was a pretty bad bug to have. 

The fix for this had me searching through form validations, axios checks, the rendering of the navigation bar and homepage, and even my api calls in my server. It took some time, but the error is now gone and users can enter the site without any issues. In addition to this fix, I also added a small message on the entry pages letting the user know a little information about what they can do in guest mode. 

I have been busy these past few weeks with applying to jobs and my courses for the fall semester, so I have not had as much time to dedicate to this project. I will still try and push an update/bugfix every once in a while though, so stay posted!

---

### What's next?
I have some small changes and features that I would like to add next, including: 
- Editing/Deleting Comments
- Replying to Comments
- Blocking Users
- Profile posts search/filters

---

