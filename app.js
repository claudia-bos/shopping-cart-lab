import express from 'express';
import nunjucks from 'nunjucks';
import morgan from 'morgan';
import session from 'express-session';
import users from './users.json' assert { type: 'json' };
import stuffedAnimalData from './stuffed-animal-data.json' assert { type: 'json' };

const app = express();
const port = '8000';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: false }));

nunjucks.configure('views', {
  autoescape: true,
  express: app,
});

function getAnimalDetails(animalId) {
  return stuffedAnimalData[animalId];
}

app.get('/', (req, res) => {
  res.render('index.html');
});

app.get('/all-animals', (req, res) => {
  res.render('all-animals.html', { animals: Object.values(stuffedAnimalData) });
});

app.get('/animal-details/:animalId', (req, res) => {
  const animalDetails = getAnimalDetails(req.params.animalId)
  res.render('animal-details.html', { animal: animalDetails });
});

app.get('/add-to-cart/:animalId', (req, res) => {
  // TODO: Finish add to cart functionality
  // The logic here should be something like:
  // - check if a "cart" exists in the session, and create one (an empty
  // object keyed to the string "cart") if not
  // - check if the desired animal id is in the cart, and if not, put it in
  // - increment the count for that animal id by 1
  // - redirect the user to the cart page

  const sess = req.session
  const animalId = req.params.animalId

  if (!sess.cart) {
    sess.cart = {}
  }
  if (!(animalId in sess.cart)) {
    sess.cart[animalId] = 0
  }
  sess.cart[animalId] += 1
  console.log(sess.cart)

  res.redirect('/cart')

});

app.get('/cart', (req, res) => {

  if(!req.session.cart) {
    req.session.cart ={}
  }
  const cart = req.session.cart
  const animals = []
  let orderTotal = 0

  for(const animalId in cart) {
    const animalDetails = getAnimalDetails(animalId)
    const qty = cart[animalId]
    animalDetails.qty = qty

    const subtotal = qty * animalDetails.price
    animalDetails.subtotal = subtotal

    orderTotal += subtotal
    animals.push(animalDetails)
  
  }

  res.render('cart.html', { animals: animals, orderTotal: orderTotal })

  // TODO: Display the contents of the shopping cart.

  // The logic here will be something like:

  // - get the cart object from the session
  // - create an array to hold the animals in the cart, and a variable to hold the total
  // cost of the order
  // - loop over the cart object, and for each animal id:
  //   - get the animal object by calling getAnimalDetails
  //   - compute the total cost for that type of animal
  //   - add this to the order total
  //   - add quantity and total cost as properties on the animal object
  //   - add the animal object to the array created above
  // - pass the total order cost and the array of animal objects to the template

  // Make sure your function can also handle the case where no cart has
  // been added to the session

});

app.get('/checkout', (req, res) => {
  // Empty the cart.
  req.session.cart = {};
  res.redirect('/all-animals');
});

app.get('/login', (req, res) => {
  // TODO: Implement this
  res.render('login.html');
});

app.post('/process-login', (req, res) => {
  // TODO: Implement this
  for (const user of users) {
    if(req.body.username === user.username && req.body.password === user.password) {
      req.session.username = user.username;
      res.redirect('/all-animals');
      return;
    }
  }
  res.render('login.html', { message: 'Invalid username or password' });
});

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect('/all-animals');
  });
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}...`);
});
