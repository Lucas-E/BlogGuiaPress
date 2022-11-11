const express = require('express');
const router = express.Router();
const slugify = require('slugify');
const Category = require('../models/index').Category;
const Article = require('../models/index').Article;

//initial route for /admin
router.get('/', (req,res)=>{
    res.render('admin/index', {title: 'Admin'})
})


// /admin/categories rout
router.get('/categories', async (req, res) => {

    const querie = await Category.findAll({raw:true})

    res.render('admin/categories/index', {title:'categories', data: querie})
})


// /admin/categories/delete for deleting a line on the table of categories
router.post('/categories/delete', async (req,res)=>{
    const id = req.body.id;
    const querie = await Category.destroy({
        where: {
            id: id
        }
    })
    res.redirect('/admin/categories')
})


// route for edit the categorie, with the id and the slug being passed as parameters
router.get('/categories/edit/:id', async (req, res) => {
    const id = req.params.id;
    if(isNaN(id)){
        res.redirect('/admin/categories');
    }else{
        const categ = await Category.findByPk(id);
        if(categ){
            res.render('admin/categories/edit', {title: 'Editar',id:id, category: categ});
        }else{
            res.redirect('/admin/categories');
        }
    }
})

// route for the /edit hit when form is sent
router.post('/categories/edit', (req, res) => {
    const id_last = req.body.id;
    const title = req.body.title;

    if(title){
        Category.update({
            title:title,
            slug: slugify(title)
        }, {
            where: {
                id: id_last
            }
        }).then(()=>{
            res.redirect('/admin/categories/')
        })
    }else{
        res.redirect('/admin/categories')
    }
})

// route for adding a new category
router.get('/categories/new', (req,res) => {
    res.render('admin/categories/new', {title:'New Category'})
})

// route that is called when the /new creates a new category
router.post('/categories/save', (req, res) => {
    var title = req.body.title;
    if(title){
        Category.create({
            title: title,
            slug: slugify(title)
        }).then(()=>{
            res.redirect('/admin/categories');
        })
        
    }else{
        res.redirect('/admin/categories/new')
    }
})


//finalizadas rotas de category

// iniciando rotas de articles

router.get('/articles/', async (req, res) => {

    try {
        const query = await Article.findAndCountAll({
            include:[{
                model: Category
            }],
            limit: 4,
            offset:0,
            order: [
                ['id','DESC']
            ]
        });
        console.log(Math.ceil(query.count/4))
        res.render('admin/articles/index', {title:'Artigos', article:query.rows, numPages: Math.ceil(query.count/4), page:0})
    } catch (error) {
        res.redirect('/admin/articles')
    }
});

router.get('/articles/page/:num', async (req, res) => {

    const num = req.params.num;

    if(isNaN(num) || num == 0){
        res.redirect('/admin/articles/');
    }else{
        try {
            const query = await Article.findAndCountAll({
                include:[{
                    model: Category
                }],
                limit: 4,
                offset:num*4,
                order: [
                    ['id','ASC']
                ]
            });
            res.render('admin/articles/index', {title:'Artigos', article:query.rows, numPages: Math.ceil(query.count/4), page:parseInt(num)})
        } catch (error) {
            res.redirect('/admin/articles')
        }
    }
});


router.get('/articles/new', async (req, res) => {

    const query = await Category.findAll({raw:true});

    res.render('admin/articles/new', {title: 'Novo Artigo', categories:query});
})

router.post('/articles/save', async (req, res) => {
    const title = req.body.title;
    const body = req.body.body;
    const category = req.body.category;

    try{
        const query = await Article.create({
            title:title,
            slug: slugify(title),
            body: body,
            CategoryId: category
        });

        res.redirect('/admin/articles/');
    }catch(e){
        res.redirect('/admin/articles/');
    }


});



router.post('/articles/delete/', async (req, res) => {

    const id = req.body.id;

    if(id){
        try {
            const query = await Article.destroy({
                where: {
                    id: id
                }
            })
            if(query){
                res.redirect('/admin/articles/')
            }
        } catch (error) {
            res.redirect('/admin/articles/')
        }
    }else{
        res.redirect('/admin/articles/')
    }


});

router.get('/articles/edit/:id', async (req,res) => {

    const id = req.params.id;

    if(isNaN(id)){
        res.redirect('/admin/articles/');
    }else{
        try {
            const query = await Article.findByPk(id);
            const listCategories = await Category.findAll({raw:true});
            res.render('admin/articles/edit', {title:'Edit article', article:query, categories:listCategories});
        } catch (error) {
            
        }
    }

})

router.post('/articles/edit/save', async (req, res) => {
    const id_last = req.body.id;
    const title = req.body.title;
    const body = req.body.body;
    const category = req.body.category;

    if(id_last && title && body && category){
        try {
            const query = await Article.update({
                title:title,
                slug:slugify(title),
                body:body,
                CategoryId: category
            }, {
                where: {
                    id:id_last
                }
            })
            res.redirect('/admin/articles/')
        } catch (error) {
            res.redirect('/admin/articles/')
        }
    }else{
        res.redirect('/admin/articles/')
    }
})

module.exports = router;