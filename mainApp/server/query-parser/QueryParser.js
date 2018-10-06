var antlr4 = require('antlr4/index');
var BailErrorStrategy = require('antlr4/error/ErrorStrategy').BailErrorStrategy;
var QueryParseListener = require('./new_QueryParseListener');
var Lexer = require('./antlr/generated/sales_rewriteLexer').sales_rewriteLexer;
var Parser = require('./antlr/generated/sales_rewriteParser').sales_rewriteParser;
//var StanfordSimpleNlp = require('stanford-simple-nlp');

function QueryParser(){

}

QueryParser.prototype.parse = function(query,fileId, cbOnExecuteComplete){	
	/*var stanfordSimpleNLP = new StanfordSimpleNLP( function(err) {
	  stanfordSimpleNLP.process(query, function(err, result) {
	      console.log(result);
	  });
	});*/
	var chars = new antlr4.InputStream(query);
	var lexer = new Lexer(chars);
	var tokens  = new antlr4.CommonTokenStream(lexer);
	var parser = new Parser(tokens);
	parser._errHandler = new BailErrorStrategy();
	parser.buildParseTrees = true;

	var tree = parser.query();

	var queryListener = new QueryParseListener(fileId,cbOnExecuteComplete);

	antlr4.tree.ParseTreeWalker.DEFAULT.walk(queryListener, tree);	
}

module.exports = QueryParser;