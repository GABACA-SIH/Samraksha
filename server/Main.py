import num2words
import nltk
from nltk.tokenize import RegexpTokenizer
tokenizer = RegexpTokenizer(r'\w+')
from nltk.corpus import stopwords
stop_words = set(stopwords.words('english')) 
from nltk.stem.porter import *
from nltk.stem import WordNetLemmatizer
nltk.download('wordnet')
stemmer=PorterStemmer()
from pyemd import emd
from gensim.models import Word2Vec
import pandas as pd
import sys

query=sys.argv[1]
df=pd.read_csv("queries_dataset.csv",encoding='unicode_escape')
n=len(df)
topics=[[] for i in range(n)]
para=[[] for i in range(n)]

for i in range(n):
    # print(i,len(topics))
    text=df.iloc[i][0]
    lemmatizer=WordNetLemmatizer()
    text=str(text)
    text=text.lower()
    token1=text.split()
    token=[]
    for x in token1:
        if x not in stop_words:
            token.append(x)
            #stemmed = [stemmer.stem(tokens) ]
    lemmatiz=[lemmatizer.lemmatize(tokens) for tokens in token]
    topics[i]=lemmatiz
    text=df.iloc[i][1]
    text=str(text)
    text=text.lower()
    token1=text.split()
    token=[]
    for x in token1:
        if x not in stop_words:
            token.append(x)
            #stemmed = [stemmer.stem(tokens) ]
    lemmatiz=[lemmatizer.lemmatize(tokens) for tokens in token]
    para[i]=lemmatiz
model_para=Word2Vec(para, min_count=1)
# model_para.init_sims(replace=True)
model_topic=Word2Vec(topics,min_count=1)
# model_topic.init_sims(replace=True)
text=query.lower()
token1=text.split()
token=[]
for x in token1:
    if x not in stop_words:
        token.append(x)
        #stemmed = [stemmer.stem(tokens) ]
lemmatiz=[lemmatizer.lemmatize(tokens) for tokens in token]
q=lemmatiz

min2=float('inf')
result=""
for i in range(n):

    distance2=model_topic.wv.wmdistance(q,topics[i])

    if distance2<min2:
        min2=distance2
        
        result=df.iloc[i][1]


if min2<2:
    print(result)
else:
    print("Sorry I don't have the answer. Please contact +91-11-26100758")
