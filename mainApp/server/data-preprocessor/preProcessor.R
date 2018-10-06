dateformats <- c('%m/%d/%y','%m/%d/%Y','%d/%m/%y','%d/%m/%Y','%Y/%m/%d','%Y/%d/%m','%d-%b-%Y','%d-%b-%y','%d-%m-%Y','%d-%m-%y','%m-%d-%Y','%m-%d-%y','%Y-%m-%d');
timeformats <- c('h:m:s','h:m','h:m:s %p')
datetimeFormats <- c(dateformats,timeformats);
columnDateFormats <- c();
#http://www.stat.berkeley.edu/~s133/dates.html
#http://permalink.gmane.org/gmane.comp.lang.r.rosuda.devel/1885
if(!require("stringr")) install.packages("stringr",repos='http://cran.us.r-project.org')
if(!require("RJSONIO")) install.packages("RJSONIO",repos='http://cran.us.r-project.org')
if(!require("mongolite")) install.packages("mongolite",repos='http://cran.us.r-project.org')
if(!require("tseries")) install.packages("tseries",repos='http://cran.us.r-project.org')
if(!require("forecast")) install.packages("forecast",repos='http://cran.us.r-project.org')

require('RJSONIO')
require('stringr')
require('mongolite')
require('tseries')
require('RJSONIO')
require('forecast')

#set working directory
#setwd("/Users/Krishay/Documents/Work/R/first")
#Read Data file
#View(sales)
createDateTimeFormats <- function(){
   space_combine_format = c(t(outer(dateformats, timeformats, paste)));
   zome_combine_format = c(t(outer(dateformats, timeformats, function(x,y){
         return (paste(x,y,sep="T"));
          })));
   datetimeFormats <<- c(datetimeFormats,space_combine_format,zome_combine_format);
}

createDateTimeFormats();

preProcess <- function(jsonObj){
  # Parse Variable
  data <- fromJSON(jsonObj);

  #set working directory
  #setwd(data["cd"]);
  #Read CSV file
  sales <- read.csv(data["path"],check.names = FALSE);
  #Assign Empty vector to dateformats of column
  columnDateFormats <<- c();
  #Get header and type map for string 1, Number 2, Date 3
  header_types <- sapply(sales,getDataTypes);
  #add column for to mark stale records
  sales <- addStaleColumn(sales);
  #add modified date columns
  sales <- addModifiedDateColumn(header_types,sales);
  #addd modified number column
  sales <- addModifiedNumColumn(header_types,sales);
  #Get range of date inside the datecolumn
  daterangelist <- getDateRangeForDateColumns(header_types,sales);
  #Insert final data to mongoDb
  insertDFToMongoDB(data["collection"],sales);

  fin <- list(header_types,daterangelist);
  names(fin) <- c("headerType","headerDateRange");
  return (toJSON(fin));
}

addModifiedNumColumn <- function(header_types,df){
    headers <- names(header_types);
    for(i in 1:length(headers)){
      if(header_types[i] == 2){
          x <- df[[headers[i]]];
          y <- gsub(",","",x);
          z <- sapply(y,function(x){
                        return (as.numeric(as.character(x)));
                        });
          df <- handleStaleRecords(df,z,x);
          z[is.na(z) == TRUE] <- 0;
          new_header <- paste(headers[i],"mod",sep="_");
          df[[new_header]] <- z;
      }
    }
    return (df);
}

addModifiedDateColumn <- function(header_types,df){
  headers <- names(header_types);
  #print(header_types);
  for(i in 1:length(headers)){
    if(header_types[i] == 3){
      format <- columnDateFormats[i];
      x <- df[[headers[i]]];
      y <- as.Date(as.character(x),format);
      z <- format(y,'%Y/%m/%d');
      df <- handleStaleRecords(df,y,x);
      z[is.na(z) == TRUE] <- '';
      new_header <- paste(headers[i],"mod",sep="_");
      df[[new_header]] <- z;
    }
  }
  return (df);
}

getDateRangeForDateColumns <- function(header_types,df){
    headers <- names(header_types);
    dateRangelist <- vector("list", length(header_types))
    names(dateRangelist) <- names(header_types)
    dateRangeNames <- c("startDate","endDate");
    for(i in 1:length(headers)){
      if(header_types[i] == 3){
         new_header <- paste(headers[i],"mod",sep="_");
         maxDate <- max(df[[new_header]]);
         minDate <- min(df[[new_header]]);
         dateRange <- c(minDate,maxDate);
         names(dateRange) <- dateRangeNames;
         dateRangelist[[i]] <- dateRange;
      }
    }
    return (dateRangelist);
}

addStaleColumn <- function(df){
	df[["flgStale"]] <- 0;
	return (df);
}

handleStaleRecords <- function(df,formattedColumn,origColumn){
	v <- df[["flgStale"]];
	v[is.na(formattedColumn) == TRUE & origColumn != ''] <- 1;
	df[["flgStale"]] <- v;
	return (df);
}


getDataTypes <- function(x){
  x[is.na(x) == TRUE] <- '';
	unique_vals <- head(unique(x[x != '']),n=20);
    dataType = 1;
    if(isNumeric(unique_vals)){
      dataType = 2;
      columnDateFormats <<- c(columnDateFormats,NA);
    }
    else if(isDate(unique_vals)){
      dataType = 3;
    }
    return (dataType);
}

isNumeric <- function(x){
  t <- grepl("^[-[:digit:]][[:digit:].,]*$",x)
  s <- any(t == FALSE)
  return (s == FALSE);
}

isDate <- function(x){
	format_Count = length(datetimeFormats);
	fin = FALSE
	tryCatch({
		for(i in 1:format_Count){
			format = dateformats[i];
			y = as.Date(as.character(x),format);
			s = any(is.na(y) == TRUE);
			fin = (s == FALSE);
			if(fin == TRUE){
			  break;
			}
		}
	}, warning = function(war) {
	 	print(war);
	}, error = function(err) {
	 	print(err);
	}, finally = {
	 	
	});

	if(fin == TRUE){
	  columnDateFormats <<- c(columnDateFormats,format);
	}
	else{
	  columnDateFormats <<- c(columnDateFormats,NA);
	}
	return (fin == TRUE)
}

insertDFToMongoDB <- function(collectionName,df){
  dbCon = mongo(collection = collectionName, url = "mongodb://localhost:27017/seed",
                                verbose = TRUE);
  dbCon$insert(df);
}
#getTypeForVals


#as.Date(as.character('22/13/96'),format="%d/%m/%Y")

execute <- function (jsonObj) {
  o = fromJSON(jsonObj);
  keys <- c();
  values <- c();
  outVals <- c();

  for(x in o$data){
    keys = append(keys, x$key);
    values = append(values, x$value);
    outVals = append(outVals, 0);
  }

  startYear <- c(o$startYear);
  if(o$frequency == 12)
    startYear <- c(o$startYear, 1);

  evalSet <- c(values[1], values[2], values[3]);
  for(i in 4:(length(values)-1)){
    evalSet = append(evalSet, values[i]);
    fVal <- getForcastValue(c(evalSet), o$frequency, startYear, o$forecastPeriod);
    if(class(fVal) == 'forecast'){
      min <- fVal$lower[1];
      max <- fVal$upper[1];
      mean <- fVal$mean['fit'];
      actVal <- values[i+1];

      if(actVal > max && max != 0){
        denom <- max;
        if(denom < 0)
          denom <- -1 * denom;
        outVals[i+1] = ((actVal - max)/denom) * 100;
      }
      else if(actVal < min && min != 0){
        outVals[i+1] = ((actVal - min)/min) * 100;
      }
      # print(keys[i+1]);
      # print(values[i+1]);
      # print(min);
      # print(max);   
      # print('-----------------')
    }
  }
    results <- outVals;
    names(results) <- keys
    return(toJSON(results));
}

getForcastValue <- function (values, nFrequency, startYear, forecastCount){
  tForecast <- tryCatch({
    tsrs  <- ts(values, frequency=nFrequency, start=startYear);
    tModel <- HoltWinters(tsrs, gamma=FALSE, l.start=values[1]);
    tForecast <- forecast.HoltWinters(tModel, h=forecastCount);
    return (tForecast);
  },
  warning = function(w){
    return (0);
  },
  error = function(e){
    return (0);
  },
  finally = {
    if(exists('tForecast')){
      return (tForecast);
    }
    else{
      return (0);
    }
  });
}