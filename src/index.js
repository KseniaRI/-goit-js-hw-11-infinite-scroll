import './css/styles.css';
import galleryCardsTml from './templates/gallery-cards.hbs';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import InfiniteScroll from 'infinite-scroll';

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
searchForm.addEventListener("submit", onSearch);
document.addEventListener("scroll", slowScroll);

const API_KEY = '27355574-70cda2d549cbba697ae43a74b';
const BASE_URL = 'https://pixabay.com/api/';

let searchQuery = "";
let gallerySlider = new SimpleLightbox('.gallery a');



function onSearch(evt) {
  
  evt.preventDefault();
  gallery.innerHTML = "";
  

 searchQuery = evt.currentTarget.elements.searchQuery.value;
  if (searchQuery === "") {
    Notify.failure("Enter something");
    gallery.innerHTML = "";
    return;
  }

  let infScroll = new InfiniteScroll(gallery, {
    path: function () {
      return `${BASE_URL}?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${this.pageIndex}`;
    },
    // responseBody: 'text',
    // domParseResponse: true,
    // checkLastPage: '.infinite-scroll-last',
    responseBody: 'json',
    status: '.page-load-status',
    history: false,
    debug: true,
  });
 
  infScroll.pageIndex = 1;
  infScroll.loadNextPage()
    .then(({ body }) => {
    if (body.totalHits !== 0) {
       Notify.success(`Hooray! We found ${body.totalHits} images.`); 
    } 
      if (body.hits.length === 0) {
      Notify.failure("Sorry, there are no images matching your search query. Please try again.");
      return;
    }
    gallerySlider.on('show.simplelightbox');
  }).catch((error)=>console.log(error));
  
  infScroll.on('load', startInfiniteScroll);
  infScroll.on('error', (error) => {
    console.log(error);
  });
  infScroll.on('last', function (body, path) {
    console.log(`Last page hit on ${path}`);
  });
  infScroll.on('request', function (path, fetchPromise) {
    fetchPromise.then((r) => {
      
      console.log(infScroll);

       if (infScroll.loadCount === Math.ceil(r.body.totalHits / 40)) {
        
        console.log(`${infScroll.loadCount} последняя страница`);
         Notify.info("We're sorry, but you've reached the end of search results.");
      }
      if (r.body.hits.length === 0) {
        // infScroll.option({ checkLastPage: '.infinite-scroll-last' });
        infScroll.destroy();
       
      } 

    })
    
 })
  
}



function startInfiniteScroll({ hits, totalHits }) {
   
  gallery.insertAdjacentHTML("beforeend", galleryCardsTml(hits));
  gallerySlider.refresh();
}

  
  

function slowScroll() {
  const { height: cardHeight } = document
  .querySelector('.gallery')
  .firstElementChild.getBoundingClientRect();

  window.scrollBy({
  top: cardHeight * 2,

  behavior: 'smooth',
});
}