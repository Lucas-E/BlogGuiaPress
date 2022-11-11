var express = require('express');
var router = express.Router();
const Article = require('../models/index').Article;
const Category = require('../models/index').Category;


/* GET home page. */
router.get('/', async function(req, res) {

  try {

    const query = await Article.findAndCountAll({
      order:[
        [
          'id',
          'DESC'
        ]
      ],
      include: [{
        model: Category
      }],
      limit: 4,
      offset:0
    });

    res.render('index', { title: 'Home', article: query.rows, numPages: Math.floor(query.count/4), page:0});
    //res.json({query})
  } catch (error) {
    res.send('Ocorreu um erro carregando a página. Volte mais tarde.')
  }
});

router.get('/page/:num', async function(req, res, next) {

  const num = req.params.num;
  var offset = 0

  if(isNaN(num) || num == 0){
    res.redirect('/')
  }else{
    offset = num;
  }
  try {
    const query = await Article.findAndCountAll({
      order:[
        [
          'id',
          'DESC'
        ]
      ],
      include: [{
        model: Category
      }],
      limit: 4,
      offset: num*4
    });

    if(num > Math.ceil(query.count/4)){
      res.redirect('/')
    }

    res.render('index', { title: 'Home', article: query.rows, numPages:Math.ceil(query.count/4), page:parseInt(num)});
    //res.json({query})
  } catch (error) {
    res.redirect('/')
    }
});

router.get('/read/:slug', async (req, res) => {
  
  const slug = req.params.slug;

  if(slug){
    try {
      const query = await Article.findOne({
        where: {
          slug:slug
        },
        include: [{
          model: Category
        }]
      });
      if(query){
        res.render('read.ejs', {title: query.title, article:query})
      }else{
        res.redirect('/')
      }


    } catch (error) {
      res.render('read.ejs', {title:'Artigo não encontrado'})
    }
  }else{
    res.redirect('/')
  }
  

})

module.exports = router;
